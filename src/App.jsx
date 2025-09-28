import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { generateClient } from 'aws-amplify/data';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Configure Amplify
Amplify.configure(outputs);

// Generate a client for your backend schema
const client = generateClient();

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', image: null });

  // Fetch notes from the backend
  async function fetchNotes() {
    try {
      const result = await client.models.Note.list();
      setNotes(result.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  }

  // Create a new note
  async function createNote(e) {
    e.preventDefault();
    try {
      const { name, description, image } = formData;

      if (!name || !description) return;

      // Create note in backend
      const result = await client.models.Note.create({
        name,
        description,
        image: image ? image.name : null,
      });

      // If an image was selected, upload to storage
      if (image) {
        await client.storage.upload(result.data.id, image, {
          contentType: image.type,
        });
      }

      setFormData({ name: '', description: '', image: null });
      fetchNotes();
    } catch (err) {
      console.error('Error creating note:', err);
    }
  }

  // Delete a note
  async function deleteNote(note) {
    try {
      await client.models.Note.delete({ id: note.id });
      setNotes(notes.filter((n) => n.id !== note.id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: '2rem' }}>
          <h1>Notes App</h1>
          <p>Welcome, {user.username}</p>

          <form onSubmit={createNote} style={{ marginBottom: '2rem' }}>
            <input
              placeholder="Note name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            />
            <button type="submit">Create Note</button>
          </form>

          <div>
            {notes.map((note) => (
              <div key={note.id} style={{ marginBottom: '1rem' }}>
                <h3>{note.name}</h3>
                <p>{note.description}</p>
                {note.image && <img src={note.image} alt={note.name} style={{ width: 200 }} />}
                <button onClick={() => deleteNote(note)}>Delete</button>
              </div>
            ))}
          </div>

          <button onClick={signOut}>Sign Out</button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;



