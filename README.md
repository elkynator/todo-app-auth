# Todo App with Supabase 📝

A modern, responsive todo list application built with vanilla HTML, CSS, and JavaScript. Features cloud storage with Supabase, real-time synchronization, offline support, and a clean responsive design.

## ✨ Features

### Core Functionality
- ✅ **Add Tasks**: Create new tasks with input validation
- ✅ **Edit Tasks**: Click on task text to edit inline
- ✅ **Delete Tasks**: Remove tasks with confirmation dialog
- ✅ **Toggle Completion**: Mark tasks as complete/incomplete
- ☁️ **Cloud Storage**: Data synced to Supabase database
- 🔄 **Real-time Updates**: Changes sync instantly across devices
- 📱 **Offline Support**: Works offline with localStorage fallback

### Advanced Features
- 🔍 **Smart Filtering**: View All, Active, or Completed tasks
- 📊 **Task Statistics**: Real-time count of total, active, and completed tasks
- 🗑️ **Bulk Actions**: Clear all completed tasks at once
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ♿ **Accessibility**: Full keyboard navigation and screen reader support
- 🎨 **Modern UI**: Clean design with smooth animations and hover effects
- 🔔 **Notifications**: User feedback for all actions

### User Experience
- **Keyboard Shortcuts**: 
  - `Enter` to add tasks
  - `Escape` to cancel editing
  - `Ctrl/Cmd + Enter` to focus input
- **Input Validation**: Prevents empty tasks and handles long text
- **Confirmation Dialogs**: Prevents accidental deletions
- **Empty State**: Helpful message when no tasks exist
- **Loading Feedback**: Visual indicators for user actions

## 🚀 Getting Started

### Quick Start (Offline Mode)
1. Download or clone the project files
2. Open `index.html` in your web browser
3. Start adding tasks! (Uses localStorage)

### Setup with Supabase (Cloud Sync)
1. **Create Supabase Project**: Sign up at [supabase.com](https://supabase.com)
2. **Run Database Schema**: Execute `supabase-schema.sql` in your Supabase SQL editor
3. **Configure App**: Update `config.js` with your Supabase URL and API key
4. **Enable Real-time**: (Optional) Enable real-time on the todos table

📖 **Detailed Setup**: See `SUPABASE_SETUP.md` for complete instructions

### File Structure
```
todo-app/
├── index.html           # Main HTML structure
├── style.css            # Complete styling and responsive design
├── script.js            # Full JavaScript functionality with Supabase
├── config.js            # Supabase configuration
├── supabase-schema.sql  # Database schema for Supabase
├── SUPABASE_SETUP.md    # Detailed setup instructions
└── README.md            # This documentation
```

### Requirements
- Modern web browser with JavaScript enabled
- Internet connection for cloud sync (optional)
- Supabase account for cloud features (free tier available)

## 🎯 How to Use

### Adding Tasks
1. Type your task in the input field
2. Click "Add Task" or press `Enter`
3. Task appears at the top of the list

### Managing Tasks
- **Complete**: Click the checkbox to mark as done
- **Edit**: Click on the task text to edit inline
- **Delete**: Click the trash icon (🗑️) to remove
- **Save Edit**: Press `Enter` or click outside the input
- **Cancel Edit**: Press `Escape`

### Filtering Tasks
Use the filter buttons to view:
- **All**: Every task (default)
- **Active**: Only incomplete tasks
- **Completed**: Only finished tasks

### Bulk Operations
- **Clear Completed**: Remove all finished tasks at once
- Confirmation required to prevent accidents

## 💻 Technical Details

### Architecture
- **Vanilla JavaScript**: No frameworks or libraries
- **MVC Pattern**: Clean separation of data, view, and logic
- **Event Delegation**: Efficient handling of dynamic elements
- **localStorage API**: Browser-native data persistence

### Data Structure
```javascript
{
  id: "unique_identifier",
  text: "Task description",
  completed: false,
  createdAt: Date object
}
```

### Key Functions
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Data Persistence**: Automatic save/load from localStorage
- **Input Sanitization**: XSS protection for user input
- **Error Handling**: Graceful failure with user feedback

### Performance Features
- **Efficient DOM Updates**: Minimal re-rendering
- **Event Optimization**: Proper cleanup to prevent memory leaks
- **Lazy Loading**: Only render visible elements
- **Debounced Input**: Smooth user interaction

## 🎨 Customization

### Color Scheme
The app uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #4f46e5;
  --success-color: #10b981;
  --danger-color: #ef4444;
  /* ... more variables */
}
```

### Responsive Breakpoints
- **Desktop**: 640px and above
- **Tablet**: 480px - 640px
- **Mobile**: Below 480px

### Accessibility Features
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full app control without mouse
- **Focus Management**: Clear visual focus indicators
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user motion preferences

## 🔧 Browser Support

### Fully Supported
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Features Used
- CSS Grid & Flexbox
- ES6+ JavaScript
- localStorage API
- CSS Custom Properties
- Modern DOM APIs

## 🐛 Troubleshooting

### Common Issues

**Tasks not saving?**
- Check if localStorage is enabled
- Clear browser cache and try again
- Ensure you're not in private/incognito mode

**App not loading?**
- Verify all three files are in the same directory
- Check browser console for JavaScript errors
- Ensure files are served over HTTP (not file://)

**Styling issues?**
- Clear browser cache
- Check if style.css is properly linked
- Verify CSS file is not corrupted

### Debug Mode
Open browser developer tools (F12) and check the console for detailed error messages and app status.

## 🚧 Future Enhancements

### Planned Features
- [ ] Due dates and reminders
- [ ] Task categories and tags
- [ ] Priority levels (High, Medium, Low)
- [ ] Search functionality
- [ ] Drag and drop reordering
- [ ] Dark mode toggle
- [ ] Export/import functionality
- [ ] Multiple todo lists
- [ ] Cloud sync capabilities

### Contributing
This is a learning project, but feel free to fork and enhance it! Some ideas:
- Add new themes
- Implement additional filters
- Add task templates
- Create mobile app version

## 📜 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🎉 Acknowledgments

Built following modern web development best practices:
- Semantic HTML5
- Mobile-first responsive design
- Progressive enhancement
- Accessibility guidelines (WCAG)
- Clean code principles

---

**Enjoy organizing your tasks!** 🎯
