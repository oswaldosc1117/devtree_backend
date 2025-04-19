import mongoose from "mongoose";
import colors from "colors";

export const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devtree')
        const url = `${connection.host}:${connection.port}`

        // console.log(connection);
        console.log(colors.cyan.bold(`Mongo db conectado en: ${url}`))
    } catch (error) {
        console.log(colors.red.bold(error.message))
        process.exit(1)
    }
}