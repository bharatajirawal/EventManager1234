const joi =require('joi');
const signup =  (req, res,next) => {
    const schema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({message:"Bad request",error});
    }
    next();
};
const login = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(8).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({message:"Bad request",error});
    }
    next();
};
export default {login,signup}