package rooms

import (
	"sync"

	"github.com/jinzhu/gorm"
)

var once sync.Once
var db *gorm.DB

// Room is a model representation of our room table
type Room struct {
	ID       float64
	Name     string
	RoomType string
}

// UserRoom is a model representation of our user_rooms table
type UserRoom struct {
	ID     float64
	RoomID float64
	UserID float64
}
