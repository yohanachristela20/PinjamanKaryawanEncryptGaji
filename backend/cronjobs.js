import cron from "node-cron";
import updateAngsuranOtomatis from './routes/UpdateAngsuranOtomatis.js';

cron.schedule('* * 1 * *', async () => {
    console.log(`Cron job dijalankan pada ${new Date().toISOString()}`);
    await updateAngsuranOtomatis();
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

// * * * * *
// | | | | |
// | | | | +-- Day of the Week (0 - 6) (0 = Sunday, 6 = Saturday)
// | | | +---- Month (1 - 12)
// | | +------ Day of the Month (1 - 31)
// | +-------- Hour (0 - 23)
// +---------- Minute (0 - 59)

console.log("Cron job untuk pembaruan angsuran otomatis telah dijalankan.");
