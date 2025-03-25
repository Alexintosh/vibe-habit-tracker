## Changing DB Path

You can point the db to any file in the filesystem, however, if you change it in the .env then you need to run `npx prisma migrate dev` this is because prisma uses artifacts.


## TODO
[ ] Migrate to Supabase or other db