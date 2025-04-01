import express from 'express'
import dotenv from 'dotenv'
import user_routes from './routes/user_route'
import appointment_routes from './routes/appointment_routes'
import examination_routes from './routes/examination_routes'
import clinic_routes from './routes/clinic_routes'
import auth_routes from './routes/auth_routes'
import { globalLimiter as rateLimitConfig } from './config/rateLimitConfig'
import cors from 'cors';
import { corsOptions } from './config/corsOption'
import helmet from 'helmet'
import { httpConfig } from './config/httpConfig'
import { contentSecurityConfig } from './config/contentSecurityConfig'

const app = express();
dotenv.config();

app.use(helmet())
app.use(helmet.contentSecurityPolicy(contentSecurityConfig))
app.use(helmet.hsts(httpConfig))
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(rateLimitConfig);


app.use('/api/auth', auth_routes)
app.use('/api/users', user_routes)
app.use('/api/appointments', appointment_routes)
app.use('/api/examinations', examination_routes)
app.use('/api/clinics', clinic_routes)

app.listen(process.env.PORT || 3000, () => {
    console.log(`Sunucu ayakta!!! ${process.env.PORT}.`);
});