package rooms

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

// AddToRooms add a new user to default rooms
func AddToRooms(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read HTTP request body", http.StatusBadRequest)
		return
	}

	jsonParsed, err := gabs.ParseJSON(body)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	var userID float64
	var ok bool
	userID, ok = jsonParsed.Search("event", "data", "new", "id").Data().(float64)
	if !ok {
		http.Error(w, "Could not find user id", http.StatusExpectationFailed)
		return
	}

	rooms := []Room{}
	db.Where("room_type = ?", "default").Find(&rooms)

	q := `INSERT INTO user_rooms (room_id, user_id) VALUES `
	for _, v := range rooms {
		rid := fmt.Sprintf("%.0f", v.ID)
		uid := fmt.Sprintf("%.0f", userID)
		q = q + "(" + s.Join([]string{rid, uid}, ",") + "),"
	}
	query := s.TrimSuffix(q, ",") + ";"
	db.Exec(query)

	w.Write([]byte("Successfully added user to default rooms."))
	return
}
