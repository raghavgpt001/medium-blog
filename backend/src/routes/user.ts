import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import {signupInput, signinInput} from '@raghavgpt001/medium-common'

const user = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

user.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const {success} = signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Invalid Inputs"
      })
    }
    const user = await prisma.user.findUnique({where: {email: body.email}});

    if(user){
        c.status(403);
        return c.json({message: "Email already taken"})
    }
    try{
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name.replace(/\b\w/g, (char: string) => char.toUpperCase()) || "Anonymous",
          catchphrase: body.catchphrase
        }
      });
      const jwt = await sign({id: user.id, name: user.name}, c.env.JWT_SECRET);
      return c.json({jwt}); 
    } catch(e){
      c.status(403);
      return c.json({message: "error while signing up"})
    }
  })
  
user.post('/signin', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate());
    
    const body = await c.req.json();
    const {success} = signinInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Invalid Inputs"
      })
    }

    const user = await prisma.user.findUnique({where: {email: body.email, password: body.password}});
    if(!user){
      c.status(403);
      return c.json({message: "Incorrect Credentials"});
    } else{
      const jwt = await sign({id: user.id, name: user.name},c.env.JWT_SECRET);
      return c.json({jwt})
    }
  })

export default user;