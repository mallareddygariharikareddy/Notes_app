# Notes App Workflow Documentation

## Project Overview
A **React Native + Expo** mobile notes application that runs on iOS, Android, and Web. It provides a clean interface for creating, editing, searching, and managing notes with features like markdown preview, dark mode, tagging, pinning, and export functionality.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Root)                          │
│  • Manages global state (all notes, active note, query)     │
│  • Loads notes on startup from AsyncStorage                 │
│  • Routes between NotesListScreen & NoteEditorScreen        │
│  • Handles CREATE, SAVE, DELETE operations                  │
└─────────────────────────────────────────────────────────────┘
           ↓ isReady? ↓ activeNote?
    ┌──────────────┬──────────────┐
    │   Loading    │   List View  │  OR  │  Edit View  │
    │ (EmptyState) │ (NotesListSc │      │(NoteEditorSc│
    └──────────────┴──────────────┘      └─────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native 0.81.5 | Cross-platform mobile UI |
| **Platform** | Expo 54.0.0 | Build tooling & dev environment |
| **Language** | TypeScript 5.9.2 | Type-safe JavaScript |
| **UI Components** | React Native | Native views (View, Text, TextInput, etc.) |
| **Storage** | AsyncStorage 2.2.0 | Local device data persistence |
| **Styling** | React Native StyleSheet | Platform-optimized CSS |
| **Safe Area** | react-native-safe-area-context | Handle notches/status bars |
| **File System** | expo-file-system | Read/write files (for export) |
| **Sharing** | expo-sharing | Share files (export notes) |

---

## Data Model

### Note Type
```typescript
type Note = {
  id: string;              // Unique identifier (timestamp + random)
  title: string;           // User-entered title
  content: string;         // Markdown-formatted content
  tags: string[];          // Searchable tags
  createdAt: number;       // Milliseconds timestamp
  updatedAt: number;       // Last modified timestamp
  pinned: boolean;         // Pinned to top of list
}
```

---

## State Management Flow

### App.tsx Global State
```
┌─────────────────────────────────────────┐
│         Root State (App.tsx)             │
├─────────────────────────────────────────┤
│ notes: Note[]              All notes     │
│ activeNoteId: string|null  Editing which│
│ query: string              Search input │
│ sortMode: SortMode         Sort method  │
│ isReady: boolean           Loaded?      │
│ colorScheme: light|dark    Theme        │
└─────────────────────────────────────────┘
         ↙         ↓         ↘
    List View  Editor View  Both use theme
```

### Data Persistence
```
┌───────────────────────────────────┐
│    notesStorage.ts Module         │
├───────────────────────────────────┤
│ listNotes()                       │ ← Loads all from AsyncStorage
│ saveNote(note)                    │ ← Saves 1 note, merges list
│ deleteNote(id)                    │ ← Removes note from list
│ createEmptyNote()                 │ ← Generates new with ID
│ isValidNote(value)                │ ← Validates data integrity
│                                   │
│ Storage Key: @notes/items/v1      │
│ Storage Type: AsyncStorage (JSON) │
└───────────────────────────────────┘
```

---

## Screen Navigation & UI Flow

### 1. App Startup
```
App.tsx loads
    ↓
useEffect + load() callback
    ↓
listNotes() from AsyncStorage
    ↓
setNotes() + setIsReady(true)
    ↓
Render list OR loading state
```

### 2. NotesListScreen (Main View)
**When:** No note is selected (`activeNoteId === null`)

```
┌─────────────────────────────────────┐
│      NotesListScreen Component      │
├─────────────────────────────────────┤
│ • Header: [+Create] [Sort] [🔍 Search]  │
│                                     │
│ • SearchBar:                        │
│   TextInput → query → filterAndSort │
│                                     │
│ • NoteCard List (FlatList):         │
│   • Title (or first line)           │
│   • Preview text                    │
│   • Tags display                    │
│   • Pinned indicator                │
│   • Created/updated date            │
│                                     │
│ • Actions per note:                 │
│   - Tap → open editor               │
│   - Pin toggle → update + save      │
│                                     │
│ • Empty State:                      │
│   Shows when no notes match search  │
└─────────────────────────────────────┘

Processing: filterAndSortNotes()
  1. Search in [title + content + tags]
  2. Sort: Pinned first
  3. Then: Created or Updated date (descending)
```

### 3. NoteEditorScreen (Edit View)
**When:** A note is selected (`activeNoteId !== null`)

```
┌─────────────────────────────────────┐
│     NoteEditorScreen Component      │
├─────────────────────────────────────┤
│ Header: [← Back] [More options ⋮]   │
│                                     │
│ Title Input                         │
│   TextInput: title field            │
│   (auto-save on blur)               │
│                                     │
│ Content Editor                      │
│   TextInput: markdown content       │
│   (live preview + word count)       │
│                                     │
│ Tags Input                          │
│   TextInput: "tag1, tag2"           │
│   parseTags() → split by comma      │
│                                     │
│ Markdown Preview                    │
│   Renders formatted content         │
│   Shows bullets, bold, headings     │
│                                     │
│ Bottom Actions:                     │
│   [Pin] [Delete] [Export] [Save]    │
└─────────────────────────────────────┘

Local Draft State:
  • Changes held in draft state
  • Save button triggers save to storage
```

---

## User Action Workflows

### ➕ CREATE NEW NOTE
```
User taps create button
    ↓
handleCreate() in App.tsx
    ↓
createEmptyNote() → generates:
  • Unique ID (timestamp + random)
  • Empty title, content, tags
  • Current timestamp for dates
  • pinned: false
    ↓
LayoutAnimation runs (smooth transition)
    ↓
setNotes([newNote, ...previous])  ← prepend to state
setActiveNoteId(newNote.id)       ← switch to editor
    ↓
saveNote(newNote) → AsyncStorage  ← async persist
    ↓
NoteEditorScreen renders
User types title and content
```

### ✏️ EDIT NOTE
```
User taps note in list
    ↓
onOpen(noteId) → setActiveNoteId(noteId)
    ↓
NoteEditorScreen renders with note data
User types in title/content/tags inputs
    ↓
Draft state updates locally (no storage yet)
    ↓
User taps Save button or blur
    ↓
handleSave(updatedNote) in App.tsx
    ↓
setNotes() → update in state array
saveNote() → merge into AsyncStorage
    ↓
NoteEditorScreen reflects changes
```

### 📌 PIN/UNPIN NOTE
```
User taps pin icon (list or editor)
    ↓
handleTogglePin(note)
    ↓
Create updated note with:
  • pinned: !note.pinned (flip boolean)
  • updatedAt: Date.now() (new timestamp)
    ↓
handleSave(updated) → storage
    ↓
List re-sort runs:
  • Pinned notes bubble to top
  • Maintain date sort within groups
```

### 🔍 SEARCH NOTES
```
User types in search box
    ↓
onQueryChange(text) → setQuery(text)
    ↓
NotesListScreen useMemo() re-runs
filterAndSortNotes(notes, query, sortMode)
    ↓
Search algorithm:
  1. Normalize query to lowercase
  2. Create searchable haystack from:
     • note.title
     • note.content
     • note.tags joined
  3. Filter notes: haystack.includes(query)
    ↓
FlatList re-renders with filtered results
```

### 🗑️ DELETE NOTE
```
User taps delete button
    ↓
Alert.alert() shows confirmation dialog
    ↓
User confirms "Delete"
    ↓
handleDelete() in App.tsx
    ↓
LayoutAnimation runs
    ↓
setNotes() filter out note.id
setActiveNoteId(null) → return to list
    ↓
deleteNote(id) → AsyncStorage  ← async persist
    ↓
NotesListScreen renders without deleted note
```

### 📤 EXPORT NOTE
```
User taps export button
    ↓
handleExport(note)
    ↓
exportNoteAsText(note):
  1. sanitizeFileName() → remove invalid chars
  2. Create text file in cache with:
     • Title
     • Tags (formatted as #tag1 #tag2)
     • Full content
  3. Share file (iOS/Android) OR
     Alert with file path (Web)
    ↓
User receives share sheet or path
```

### 🌓 DARK MODE
```
App startup
    ↓
useColorScheme() reads device setting
    ↓
getTheme(colorScheme) returns:
  • Light theme OR
  • Dark theme
    ↓
Memoized to prevent re-renders
    ↓
All components receive via props
Components apply theme.colors to StyleSheet
    ↓
System appearance change detected
    ↓
ColorScheme updates → theme updates → re-render
```

---

## Component Hierarchy

```
App.tsx
├── StatusBar (expo-status-bar)
├── SafeAreaProvider
│   └── View (main container)
│       ├── EmptyState (loading)
│       ├── NoteEditorScreen (when activeNote exists)
│       │   ├── SafeAreaView
│       │   ├── KeyboardAvoidingView
│       │   ├── TextInput (title)
│       │   ├── TextInput (content)
│       │   ├── TextInput (tags)
│       │   ├── MarkdownPreview
│       │   └── IconButtons (actions)
│       │
│       └── NotesListScreen (when activeNote is null)
│           ├── SafeAreaView
│           ├── TextInput (search)
│           ├── FlatList
│           │   └── NoteCard × N
│           │       ├── Title text
│           │       ├── Preview text
│           │       ├── Tags display
│           │       ├── Date display
│           │       └── Pin icon
│           └── Pressable (create button)
```

---

## Utilities & Services

### utils/notes.ts
- `getNoteDisplayTitle()` - Use title if set, else first line of content
- `getNotePreview()` - Strip markdown, truncate for list view
- `parseTags()` - Split comma-separated input, dedupe, trim
- `tagsToInput()` - Convert array back to comma-separated string
- `filterAndSortNotes()` - Core search & sort logic

### utils/date.ts
- `formatNoteDate()` - Human-readable relative dates (e.g., "2 hours ago")

### services/exportService.ts
- `sanitizeFileName()` - Remove invalid chars from title
- `exportNoteAsText()` - Create .txt file and share via OS

### storage/notesStorage.ts
- `createId()` - Generate unique ID
- `createEmptyNote()` - Factory function for new notes
- `listNotes()` - Load all from AsyncStorage with validation
- `saveNote()` - Merge single note into full list
- `deleteNote()` - Remove from list
- `isValidNote()` - Type guard for stored data

---

## Theme System

```
getTheme(colorScheme) returns AppTheme object:
{
  mode: 'light' | 'dark',
  colors: {
    background: color,
    foreground: color,
    border: color,
    accent: color,
    destructive: color
  }
}

Memoized to prevent unnecessary theme object creation
Passed as prop throughout component tree
StyleSheet.create() uses theme.colors for dynamic colors
```

---

## Data Flow Summary: Note Lifecycle

```
┌─────────────────────────────────────┐
│ CREATE                              │
│ createEmptyNote() → setNotes()      │
│ → saveNote() → AsyncStorage         │
│                                     │
│ isReady: false → display loading    │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ LIST (App.tsx state)                │
│ notes[]: displayed in NotesListSc   │
│ filterAndSortNotes() on render      │
│ Tap to edit → setActiveNoteId       │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ EDIT (NoteEditorScreen)             │
│ Local draft state, live preview     │
│ User modifies title/content/tags    │
│ Tap save → handleSave()             │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ SAVE/UPDATE (App.tsx)               │
│ setNotes() → update state array     │
│ saveNote() → AsyncStorage JSON      │
│ Reflect changes in list             │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ DELETE                              │
│ Confirmation → setNotes() filter    │
│ deleteNote() → AsyncStorage         │
│ Return to list view                 │
└─────────────────────────────────────┘
```

---

## Key Design Patterns

| Pattern | Usage |
|---------|-------|
| **Lift State Up** | All note data in App.tsx, passed to screens via props |
| **useCallback** | Memoize event handlers to prevent re-renders |
| **useMemo** | Calculate filtered/sorted notes only when dependencies change |
| **Optimistic UI** | Update state immediately, save async in background |
| **Controlled Components** | TextInputs controlled by React state, not native |
| **Type Guards** | `isValidNote()` validates AsyncStorage data |
| **Memoization** | Theme object memoized, note lookup memoized |

---

## Performance Optimizations

1. **FlatList** - Rendered only visible items in notes list
2. **useMemo** - filterAndSortNotes() only recalculates on data change
3. **useCallback** - Event handlers wrapped to maintain referential equality
4. **Lazy Rendering** - Editor screen only renders when activeNote exists
5. **LayoutAnimation** - Hardware-accelerated transitions on create/delete
6. **Theme Memoization** - getTheme() result memoized by colorScheme

---

## Storage Details

- **Key:** `@notes/items/v1`
- **Location:** AsyncStorage (device local storage)
- **Format:** JSON array of Note objects
- **Persistence:** Persistent across app restarts
- **Backup:** Device-dependent (depends on OS backup settings)

---

## Known Limitations

- **Single Device:** Data syncs only locally, no cloud backup
- **No Conflict Resolution:** Last-write-wins for concurrent edits
- **No Rich Text:** Supports markdown as plaintext, not true styling
- **No Encryption:** Notes stored unencrypted in device storage
- **iOS Web:** Limited export functionality on web platform

---

## Running the App

```bash
npm install              # Install dependencies
npm run start:expo       # Expo Go (fastest dev loop)
npm run android:expo     # Android emulator
npm run ios:expo         # iOS simulator (Mac only)
npm run web              # Web browser
npm run typecheck        # Validate TypeScript
```

For native builds: `npm run android:cli` or `npm run ios:cli` (requires Android Studio/Xcode)
