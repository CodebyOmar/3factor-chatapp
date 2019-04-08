package notifications

import (
	"sync"

	"github.com/jinzhu/gorm"
)

var once sync.Once
var db *gorm.DB

// Result type
type Result struct {
	PushToken string
	RoomID    string
	UserID    string
	Username  string
}
