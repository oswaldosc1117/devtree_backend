import { Request, Response } from "express";
import slug from "slug";
import cloudinary from "../config/cloudinary";
import formidable from "formidable";
import { v4 as uuid } from "uuid"
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";

export class UserController {

    static async createAccount(req: Request, res: Response) {

        const user = new User(req.body)
        const { email, password } = req.body

        // Verificar si el ususario existe
        const userExist = await User.findOne({ email })

        if (userExist) {
            const error = new Error('Ya existe un usuario con ese E-Mail')
            res.status(409).json({ error: error.message })
            return
        }

        // Verificar si el handle existe
        const handle = slug(req.body.handle, '')
        const handleExist = await User.findOne({ handle })

        if (handleExist) {
            const error = new Error('Nombre de usuario no disponible')
            res.status(409).json({ error: error.message })
            return
        }

        user.handle = handle

        // Hashear Passwors
        user.password = await hashPassword(password)

        user.save()
        res.status(201).json('Usuario creado correctamente')
    }

    static async login(req: Request, res: Response) {

        const { email, password } = req.body

        // Verificar si el ususario existe
        const user = await User.findOne({ email })

        if (!user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }

        // Verificar contraseña
        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('La contraseña es incorrecta')
            res.status(401).json({ error: error.message })
            return
        }

        const token = generateJWT({ id: user._id })

        res.send(token)
    }

    static async getUser(req: Request, res: Response) {
        res.json(req.user)
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const { description, links } = req.body

            const handle = slug(req.body.handle, '')
            const handleExist = await User.findOne({ handle })
            if (handleExist && handleExist.email !== req.user.email) {
                const error = new Error('Nombre de usuario no disponible')
                res.status(409).json({ error: error.message })
                return
            }

            // Actualizar usuario
            req.user.description = description
            req.user.handle = handle
            req.user.links = links
            await req.user.save()
            res.send('Perfil actualizado correctamente')

        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }

    static async uploadImage(req: Request, res: Response) {
        const form = formidable({multiples: false})
        
        try {
            form.parse(req, (error, fields, files) => {
                cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid() }, async function(error, result) {
                    if(error){
                        const error = new Error('Hubo un error al subir la imagen')
                        res.status(500).json({ error: error.message })
                        return 
                    }
                    if(result){
                        req.user.image = result.secure_url
                        await req.user.save()
                        res.json({image: result.secure_url})
                    }
                })
            })
        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }

    static async getUserByHandle(req: Request, res: Response) {
        try {
            const { handle } = req.params
            const user = await User.findOne({ handle }).select('-_id -__v -email -password')

            if(!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            res.json(user)
        } catch (e) {
           const error = new Error('Hubo un error')
           res.status(500).json({ error: error.message })
           return 
        }
    }

    static async searchByHandle(req: Request, res: Response) {
        try {

            const { handle } = req.body

            const userExist = await User.findOne({ handle })

            if(userExist) {
                const error = new Error(`${handle} ya se encuentra registrado`)
                res.status(409).json({ error: error.message })
                return
            }

            res.send(`${handle} está disponible`)
        } catch (e) {
           const error = new Error('Hubo un error')
           res.status(500).json({ error: error.message })
           return 
        }
    }
}

/** NOTAS GENERALES
 * 
 * 1.- En el select('-password') al emplear el guión seguido del nombre del campo, se indica que debe devolver todos los campos menos el que se le está pasando.
*/