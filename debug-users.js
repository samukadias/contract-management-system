import { User } from './src/entities/User.js';

async function debugUsers() {
    try {
        console.log("Fetching User.me()...");
        const me = await User.me();
        console.log("User.me():", JSON.stringify(me, null, 2));

        console.log("\nFetching User.list()...");
        const users = await User.list();
        console.log("User.list() count:", users.length);
        console.log("User.list() names:", users.map(u => u.full_name));

        const filtered = users.filter(u => u.perfil === 'ANALISTA' || u.perfil === 'GESTOR');
        console.log("\nFiltered users (ANALISTA/GESTOR):", filtered.map(u => u.full_name));

        const match = filtered.find(u =>
            u.full_name?.trim().toLowerCase() === me.full_name?.trim().toLowerCase()
        );

        console.log("\nMatch found?", match ? "YES: " + match.full_name : "NO");
    } catch (e) {
        console.error(e);
    }
}

debugUsers();
