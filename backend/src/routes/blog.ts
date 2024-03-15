import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import {createBlogInput, updateBlogInput} from '@raghavgpt001/medium-common'

const blog = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string
    }
}>();

blog.use('/*', async(c, next)=>{
    try{
      const jwt = c.req.header('Authorization') || "";
      console.log(jwt)
      if(!jwt){
        c.status(403);
        return c.json({message: "unauthorized"});
      }
      const token = jwt.split(' ')[1];
      const user = await verify(token, c.env.JWT_SECRET);
      c.set('userId',user.id)
      await next();
    } catch(err){
      c.status(403);
      return c.json({message: "unauthorized"});
    }
})
  
  
blog.post('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Invalid Inputs"
      })
    }

    const post = await prisma.blog.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: Number(c.get('userId')) 
        }
    })
    return c.json({
        id: post.id
    });
})

blog.put('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success} = updateBlogInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Invalid Inputs"
      })
    }

    const post = await prisma.blog.update({where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content
        }
    });

    return c.json({
        id: post.id
    })
})

blog.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	try{
        console.log("posts")
        const posts = await prisma.blog.findMany({
            select: {
                content: true,
                title: true,
                id: true,
                authorId: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });
        console.log(posts)
        return c.json(posts);
    } catch(err){
        return c.json({message: err})
    }
})

blog.get('/:id', async(c) => {
    const id = c.req.param('id')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try{
        const post = await prisma.blog.findFirst({
            where: {id: Number(id)},
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
        
        return c.json(post)
    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})


export default blog;
