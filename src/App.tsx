import Todo from './components/Todo'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Todo />
      <Toaster position="top-right" />
    </main>
  )
}

export default App
