package notifications

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	s "strings"

	"github.com/Jeffail/gabs"
	"github.com/jinzhu/gorm"

	// Postgres driver needed to connect to database
	_ "github.com/jinzhu/gorm/dialects/postgres"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

func init() {
	once.Do(func() {
		args := []string{
			"host=" + os.Getenv("DB_HOST"),
			"port=" + os.Getenv("DB_PORT"),
			"user=" + os.Getenv("DB_USER"),
			"dbname=" + os.Getenv("DB_NAME"),
			"password=" + os.Getenv("DB_PASSWORD"),
		}
		var err error
		db, err = gorm.Open("postgres", s.Join(args, " "))
		if err != nil {
			fmt.Printf("failed to connect to DB: %v", err.Error())
			panic(err.Error())
		}
	})
}

// SendPushNotifications delivers message notifications to users
func SendPushNotifications(w http.ResponseWriter, r *http.Request) {
	body, readErr := ioutil.ReadAll(r.Body)
	if readErr != nil {
		http.Error(w, "Failed to read request error", http.StatusInternalServerError)
		return
	}

	jsonParsed, err := gabs.ParseJSON(body)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	var message string
	var ok bool
	message, ok = jsonParsed.Search("event", "data", "new", "msg_text").Data().(string)
	if !ok {
		http.Error(w, "Could not find message text", http.StatusExpectationFailed)
		return
	}

	// Get tokens of all users in the rooms
	tokens, e := getUserPushToken(jsonParsed)
	if e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
		return
	}

	messages := make([]expo.PushMessage, 0)
	for _, v := range tokens {
		// To check the token is valid
		pushToken, err := expo.NewExponentPushToken(v)
		if err != nil {
			panic(err)
		}
		msg := expo.PushMessage{
			To:       pushToken,
			Body:     message,
			Data:     nil,
			Sound:    "default",
			Title:    "New Message",
			Priority: expo.DefaultPriority,
		}

		messages = append(messages, msg)
	}

	// Create a new Expo SDK client
	client := expo.NewPushClient(nil)

	// Publish messages
	responses, err := client.PublishMultiple(messages)
	// Check errors
	if err != nil {
		http.Error(w, "Unable to send push notifications", http.StatusExpectationFailed)
		return
	}
	// Validate responses
	var failedResponses int
	for _, v := range responses {
		if v.ValidateResponse() != nil {
			failedResponses++
		}
	}

	res := fmt.Sprintf("%v out of %v failed to deliver.", failedResponses, len(responses))
	fmt.Println(res)
	w.Write([]byte(res))
}

func getUserPushToken(jsonBody *gabs.Container) ([]string, error) {
	var retErr error

	var rid float64
	var ok bool
	rid, ok = jsonBody.Search("event", "data", "new", "room_id").Data().(float64)
	if !ok {
		retErr = fmt.Errorf("Could not find room id")
		return nil, retErr
	}

	rows, dbErr := db.Table("user_rooms").Select("user_rooms.user_id, user_rooms.room_id, users.push_token, users.username").Joins("JOIN users on user_rooms.user_id = users.id").Where("user_rooms.room_id = ?", rid).Rows()
	defer rows.Close()
	if dbErr != nil {
		fmt.Println("failed to fetch.:", dbErr)
	}

	tokens := make([]string, 0)
	for rows.Next() {
		var row Result
		db.ScanRows(rows, &row)
		if s.HasPrefix(row.PushToken, "ExponentPushToken") {
			tokens = append(tokens, row.PushToken)
		}
	}

	return tokens, retErr
}
