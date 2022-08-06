import { PG_PASSWORD, PG_HOST, PG_USER } from '$env/static/private';
import postgres from 'postgres';

const sql = postgres({
	host: PG_HOST,
	port: 5432,
	username: PG_USER,
	password: PG_PASSWORD,
	database: 'pizzapp',
	max_lifetime: 10
});

export default sql;
