const {
    buildAbility,
} = require("../utils/ability");

const requirePermission = (
    action,
    subject
) => {
    return async (
        req,
        res,
        next
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required.",
                });
            }


            console.log('req.user',req.user);

            const ability =
                await buildAbility(
                    req.user
                );

            if (
                ability.cannot(
                    action,
                    subject
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have permission to perform this action.",
                });
            }

            req.ability = ability;

            next();
        } catch (error) {
            console.error(
                "CASL error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Authorization check failed.",
            });
        }
    };
};

module.exports = {
    requirePermission,
};