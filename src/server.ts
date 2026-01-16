import express, { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Tipos
interface User {
  id: number;
  name: string;
  email: string;
}

// Base de datos simulada
let users: User[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, name: 'María García', email: 'maria@example.com' }
];

// Rutas
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API funcionando correctamente', version: '1.0.0' });
});

// GET - Obtener todos los usuarios
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ success: true, data: users });
});

// GET - Obtener un usuario por ID
app.get('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }
  
  res.json({ success: true, data: user });
});

// POST - Crear un nuevo usuario
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Nombre y email son requeridos' });
  }
  
  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email
  };
  
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT - Actualizar un usuario
app.put('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { name, email } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }
  
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;
  
  res.json({ success: true, data: users[userIndex] });
});

// DELETE - Eliminar un usuario
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ success: true, message: 'Usuario eliminado', data: deletedUser });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});