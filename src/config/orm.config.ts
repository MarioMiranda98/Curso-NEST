import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AttendeeEntity } from "src/attendee.entity";
import { Profile } from "src/auth/profile.entity";
import { User } from "src/auth/user.entity";
import { EventEntity } from "src/events/event.entity";
import { Subject } from "src/school/subject.entity";
import { Teacher } from "src/school/teacher.entity";

export default registerAs( 'orm.config',(): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [EventEntity, AttendeeEntity, Subject, Teacher, Profile, User],
    synchronize: true
}));