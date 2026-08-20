import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { User } from "../modules/users/user.model.js";
import { hashPassword } from "../utils/password.js";

const seedAdmin = async () => {
  try {
    console.log("🌱 Connecting to MongoDB to seed Administrator account...");
    await connectDatabase();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@edupac.cm";
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const adminPhone = process.env.ADMIN_PHONE || "670 00 00 00";

    const hashedPassword = await hashPassword(adminPassword);

    let admin = await User.findOne({
      $or: [{ email: adminEmail.toLowerCase() }, { username: adminUsername.toLowerCase() }],
    });

    if (admin) {
      console.log(`ℹ️ Admin user already exists (@${admin.username}). Updating admin credentials...`);
      admin.name = "Edupac Super Administrator";
      admin.role = "admin";
      admin.password = hashedPassword;
      admin.isVerified = true;
      admin.verificationStatus = "approved";
      admin.profileHeadline = "Edupac Platform Administrator";
      await admin.save();
      console.log(`✅ Administrator account updated successfully!`);
    } else {
      admin = await User.create({
        name: "Edupac Super Administrator",
        username: adminUsername.toLowerCase(),
        email: adminEmail.toLowerCase(),
        phoneNumber: adminPhone,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        verificationStatus: "approved",
        profileHeadline: "Edupac Platform Administrator",
        bio: "Managing Cameroon career guidance data, school accreditations, and platform operations.",
      });
      console.log(`🎉 Administrator account created successfully!`);
    }

    console.log(`========================================`);
    console.log(`🛡️  ADMIN LOGIN CREDENTIALS:`);
    console.log(`   Username / Email:  ${admin.username}  OR  ${admin.email}`);
    console.log(`   Password:          ${adminPassword}`);
    console.log(`   Role:              admin`);
    console.log(`========================================`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed Administrator:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
