import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Availability } from './entities/availability.entity';

const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'task_db',
    entities: [User, Task, Availability],
    synchronize: true,
});

async function run() {
    await ds.initialize();
    const userRepo = ds.getRepository(User);

    const existing = await userRepo.findOne({ where: { username: 'admin' } });
    if (!existing) {
        const passwordHash = await bcrypt.hash('admin1234$', 10);
        const admin = userRepo.create({
            email: 'admin@example.com',
            username: 'admin',
            name: 'Admin User',
            passwordHash,
        });
        await userRepo.save(admin);
        // Add a couple of demo users
        const demo1 = userRepo.create({ email: 'john@example.com', username: 'john', name: 'John Doe', passwordHash });
        const demo2 = userRepo.create({ email: 'jane@example.com', username: 'jane', name: 'Jane Smith', passwordHash });
        await userRepo.save([demo1, demo2]);
    }

    await ds.destroy();
    // eslint-disable-next-line no-console
    console.log('Seed completed');
}

run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});


