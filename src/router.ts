import Router from "express";
import { body, param } from "express-validator";
import { UserController } from "./controllers/userController";
import { handleInputErrors } from "./middleware/validation";
import { authenticate } from "./middleware/auth";

const router = Router();

// Autenticacion y registro
router.post("/auth/register",

    // Validar campos
    body("handle")
        .notEmpty().withMessage("El campo no puede ir vacío"),
    body("name")
        .notEmpty().withMessage("El campo no puede ir vacío"),
    body("lastname")
        .notEmpty().withMessage("El campo no puede ir vacío"),
    body("email")
        .isEmail().withMessage("El campo debe ser un correo válido"),
    body("password")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),

    handleInputErrors,
    UserController.createAccount
);

// Login
router.post("/auth/login",

    // Validar campos
    body("email")
        .isEmail().withMessage("El campo debe ser un correo válido"),
    body("password")
        .isLength({ min: 8 }).withMessage("La contraseña es obligatoria"),

    handleInputErrors,
    UserController.login
);

// Obtener usuario autenticado
router.get("/user", authenticate, UserController.getUser)

// Actualizar el usuario
router.patch("/user-update",

    body('handle')
        .notEmpty().withMessage('El campo no puede ir vacío'),

    handleInputErrors,
    authenticate,
    UserController.updateProfile
)

// Subir imagen del usuario
router.post('/user/image', authenticate, UserController.uploadImage)

// Obtener usuario por su handle
router.get('/:handle',

    authenticate,
    UserController.getUserByHandle
)

// Comprobar si un handle está ocupado
router.post('/search',
    body('handle')
        .notEmpty().withMessage('El campo no puede ir vacío'),

    handleInputErrors,
    authenticate,
    UserController.searchByHandle
)

export default router;
