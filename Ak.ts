### **Complete File Structure**

```
project-root/
├── backend/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── models/
│   │   ├── Address.ts
│   │   └── User.ts
│   ├── routes/
│   │   └── userRoutes.ts
│   ├── uploads/
│   │   ├── profilePhotos/
│   │   └── appointmentLetters/
│   ├── utils/
│   │   └── validateEnv.ts
│   ├── app.ts
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddUser.tsx
│   │   │   ├── ViewUser.tsx
│   │   │   └── EditUser.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── react-app-env.d.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

### **Backend Code (Node.js with Sequelize)**

#### **backend/package.json**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.ts",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "sequelize": "^6.32.1",
    "mysql2": "^3.3.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.1",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.3.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.1.3"
  }
}
```

#### **backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

#### **backend/.env**

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret_key
```

#### **backend/src/utils/validateEnv.ts**

```typescript
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_SECRET',
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Error: Missing environment variable ${key}`);
    process.exit(1);
  }
});

export default {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
  },
  jwtSecret: process.env.JWT_SECRET!,
};
```

#### **backend/src/config/database.ts**

```typescript
import { Sequelize } from 'sequelize';
import config from '../utils/validateEnv';

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false,
  }
);

export default sequelize;
```

#### **backend/src/models/User.ts**

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePic?: string;
  appointmentLetter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public profilePic?: string;
  public appointmentLetter?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
      },
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    profilePic: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    appointmentLetter: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    sequelize,
  }
);

export default User;
```

#### **backend/src/models/Address.ts**

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface AddressAttributes {
  id: number;
  userId: number;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, 'id'> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public id!: number;
  public userId!: number;
  public companyAddress!: string;
  public companyCity!: string;
  public companyState!: string;
  public companyZip!: string;
  public homeAddress!: string;
  public homeCity!: string;
  public homeState!: string;
  public homeZip!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    companyAddress: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    companyCity: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    companyState: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    companyZip: {
      type: new DataTypes.STRING(6),
      allowNull: false,
      validate: {
        len: {
          args: [6, 6],
          msg: 'Company Zip must be exactly 6 digits',
        },
      },
    },
    homeAddress: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    homeCity: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    homeState: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    homeZip: {
      type: new DataTypes.STRING(6),
      allowNull: false,
      validate: {
        len: {
          args: [6, 6],
          msg: 'Home Zip must be exactly 6 digits',
        },
      },
    },
  },
  {
    tableName: 'addresses',
    sequelize,
  }
);

User.hasOne(Address, { foreignKey: 'userId', as: 'address' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Address;
```

#### **backend/src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../utils/validateEnv';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: User;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: number };
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
```

#### **backend/src/middleware/upload.ts**

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profilePhoto') {
      cb(null, 'uploads/profilePhotos/');
    } else if (file.fieldname === 'appointmentLetter') {
      cb(null, 'uploads/appointmentLetters/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'profilePhoto') {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, and PNG files are allowed for profile photos'));
  } else if (file.fieldname === 'appointmentLetter') {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed for appointment letters'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

export default upload;
```

#### **backend/src/controllers/userController.ts**

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Address from '../models/Address';
import config from '../utils/validateEnv';

export const signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    companyAddress,
    companyCity,
    companyState,
    companyZip,
    homeAddress,
    homeCity,
    homeState,
    homeZip,
  } = req.body;

  try {
    const profilePhoto = req.file && req.file.fieldname === 'profilePhoto' ? req.file.path : null;
    const appointmentLetter = req.file && req.file.fieldname === 'appointmentLetter' ? req.file.path : null;

    const user = await User.create({
      firstName,
      lastName,
      email,
      profilePic: profilePhoto,
      appointmentLetter: appointmentLetter,
    });

    await Address.create({
      userId: user.id,
      companyAddress,
      companyCity,
      companyState,
      companyZip,
      homeAddress,
      homeCity,
      homeState,
      homeZip,
    });

    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user' });
  }
};

export const viewUser = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Address,
        as: 'address',
      }],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const editUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const {
    firstName,
    lastName,
    email,
    companyAddress,
    companyCity,
    companyState,
    companyZip,
    homeAddress,
    homeCity,
    homeState,
    homeZip,
  } = req.body;

  try {
    const user = await User.findByPk(userId);
    const address = await Address.findOne({ where: { userId } });

    if (!user || !address) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    if (req.files) {
      if (req.files['profilePhoto']) {
        user.profilePic = (req.files['profilePhoto'] as Express.Multer.File[])[0].path;
      }
      if (req.files['appointmentLetter']) {
        user.appointmentLetter = (req.files['appointmentLetter'] as Express.Multer.File[])[0].path;
      }
    }

    await user.save();

    address.companyAddress = companyAddress;
    address.companyCity = companyCity;
    address.companyState = companyState;
    address.companyZip = companyZip;
    address.homeAddress = homeAddress;
    address.homeCity = homeCity;
    address.homeState = homeState;
    address.homeZip = homeZip;

    await address.save();

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};
```

#### **backend/src/routes/userRoutes.ts**

```typescript
import express from 'express';
import { signup, login, addUser, viewUser, editUser } from '../controllers/userController';
import auth from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Add User with file uploads
router.post('/users', auth, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'appointmentLetter', maxCount: 1 },
]), addUser);

// View Users
router.get('/users', auth, viewUser);

// Edit User with file uploads
router.put('/users/:id', auth, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'appointmentLetter', maxCount: 1 },
]), editUser);

export default router;
```

#### **backend/src/app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads/profilePhotos', express.static(path.join(__dirname, '..', 'uploads/profilePhotos')));
app.use('/uploads/appointmentLetters', express.static(path.join(__dirname, '..', 'uploads/appointmentLetters')));

app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
```

#### **backend/src/server.ts**

```typescript
import app from './app';
import sequelize from './config/database';
import config from './utils/validateEnv';
import User from './models/User';
import Address from './models/Address';

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
```

---

### **Frontend Code (React)**

#### **frontend/package.json**

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@types/jwt-decode": "^3.1.1",
    "axios": "^1.4.0",
    "formik": "^2.4.2",
    "jwt-decode": "^3.1.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.2",
    "yup": "^1.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.12",
    "@types/react-dom": "^18.2.5",
    "@types/react-router-dom": "^5.3.3",
    "typescript": "^5.1.3"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

#### **frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

#### **frontend/src/services/api.ts**

```typescript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
```

#### **frontend/src/App.tsx**

```tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AddUser from './components/AddUser';
import ViewUser from './components/ViewUser';
import EditUser from './components/EditUser';

const App: React.FC = () => {
  const [jwtToken, setJwtToken] = useState<string | null>(localStorage.getItem('jwt'));

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setJwtToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/add-user" />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/view-user" element={<ViewUser handleLogout={handleLogout} />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
      </Routes>
    </Router>
  );
};

export default App;
```

#### **frontend/src/components/AddUser.tsx**

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    homeAddress: '',
    homeCity: '',
    homeState: '',
    homeZip: '',
    profilePhoto: null as File | null,
    appointmentLetter: null as File | null,
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key as keyof typeof formData]) {
        data.append(key, formData[key as keyof typeof formData] as any);
      }
    });

    try {
      await API.post('/users', data);
      navigate('/view-user');
    } catch (error) {
      alert('Error adding user');
    }
  };

  return (
    <div>
      <h2>Add User</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="firstName" placeholder
