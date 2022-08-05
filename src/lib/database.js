import { PG_PASSWORD, PG_HOST } from '$env/static/private';
import postgres from 'postgres';

const sql = postgres({
	host: PG_HOST,
	port: 5432,
	username: 'postgres',
	password: PG_PASSWORD,
	database: 'pizzapp'
});

export default sql;
