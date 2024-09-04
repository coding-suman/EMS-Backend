const cron = require('node-cron');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

console.log("Cron job script loaded.");

cron.schedule('*/1 8-18 * * *', async () => {
    console.log("Cron job started at:", new Date());

    try {
        const now = new Date();
        console.log("Checking attendance reminders...");

        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        const tenAM = new Date(now.setHours(10, 0, 0, 0));

        const users = await User.find();
        console.log(`Found ${users.length} users to check.`);

        for (const user of users) {
            const attendance = await Attendance.findOne({
                userId: user._id,
                checkInTime: { $gte: startOfDay, $lte: endOfDay }
            });

            const existingNotification = await Notification.findOne({
                userId: user._id,
                type: 'checkin_reminder',
                read: false,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            if ((!attendance || now > tenAM) && !existingNotification) {
                console.log(`Sending check-in reminder to user ${user._id} -  ${user.firstName}.`);
                await Notification.create({
                    userId: user._id,
                    message: 'Reminder: You have not checked in today.',
                    type: 'checkin_reminder'
                });
            }
        }

        if (now.getHours() === 16 && now.getMinutes() === 0) {
            console.log("Checking for users who have not checked out.");
            const activeAttendances = await Attendance.find({
                checkOutTime: null,
                checkInTime: { $gte: startOfDay, $lte: endOfDay }
            });

            for (const attendance of activeAttendances) {
                const existingCheckoutNotification = await Notification.findOne({
                    userId: attendance.userId,
                    type: 'checkout_reminder',
                    read: false,
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                });

                if (!existingCheckoutNotification) {
                    console.log(`Sending checkout reminder to user ${attendance.userId}.`);
                    await Notification.create({
                        userId: attendance.userId,
                        message: 'You have not checked out for today.',
                        type: 'checkout_reminder'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error sending attendance reminders:', error);
    }
});
