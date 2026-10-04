const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const RolePermission = require("../models/RolePermission");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

// Register User
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "student",
            phone,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

// Login User


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user and include password
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        })
            .select("+password")
            .populate(
                "roleId",
                "_id name slug status"
            );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check user status
        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
        }

        // Check role
        if (
            !user.roleId ||
            user.roleId.status !== "active"
        ) {
            return res.status(403).json({
                success: false,
                message: "Your assigned role is inactive",
            });
        }

        // Verify password
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // Get role permissions
        const rolePermissions =
            await RolePermission.find({
                roleId: user.roleId._id,
            }).populate(
                "permissionId",
                "slug status"
            );

        // Extract active permission slugs
        const permissions =
            rolePermissions
                .filter(
                    (item) =>
                        item.permissionId &&
                        item.permissionId.status ===
                            "active"
                )
                .map(
                    (item) =>
                        item.permissionId.slug
                );

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT
        const token = generateToken(user);

        // Response user
        const responseUser = {
            id: user._id,
            name: user.name,
            email: user.email,

            roleId: {
                _id: user.roleId._id,
                name: user.roleId.name,
                slug: user.roleId.slug,
                status: user.roleId.status,
            },

            phone: user.phone,
            status: user.status,
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: responseUser,
            permissions,
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

module.exports = {
    register,
    login,
};  