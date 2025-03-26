import express from 'express'
import dotenv from 'dotenv'
import user_routes from './routes/user_route'
import appointment_routes from './routes/appointment_routes'
import examination_routes from './routes/examination_routes'
import clinic_routes from './routes/clinic_routes'
import auth_routes from './routes/auth_routes'
import rateLimit from 'express-rate-limit'
import cors from 'cors';

const app = express();
dotenv.config();

app.use(express.json());

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: { error: "Çok fazla istek yaptınız, lütfen daha sonra tekrar deneyin." },
    headers: true,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

app.use('/api/auth', auth_routes)
app.use('/api/users', user_routes)
app.use('/api/appointments', appointment_routes)
app.use('/api/examinations', examination_routes)
app.use('/api/clinics', clinic_routes)

app.listen(process.env.PORT || 3000, () => {
    console.log(`Sunucu ayakta!!! ${process.env.PORT}.`);
});