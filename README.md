# API: Express + DB

Como requisito principal se debe tener instalado Postgresql, sino es así podemos seguir la siguiente documentación [mini Tutorial SQL (Postgresql)](https://github.com/AngelDiaz-21/mini-TutorialSQL) antes de continuar.

## Parte 1 : Conexión a Base de Datos Postgresql

1. Se creó un proyecto de JS así como desde un principio se incluye el control de versiones de GIT.
2. Se inicializo el proyecto con npm, con el comando `npm init`.
3. Se agregó la dependencia de Express y de Prisma DB (nos ayudará a conectarnos a Postgresql). Para esto utilizamos los siguientes comandos:

```
    npm install express --save-dev
    npm install prisma --save-dev
```

4. Se inicializo prisma con el siguiente comando: `npx prisma init`. Después de correr el comando se creó el archivo `.env` y la carpeta `prisma`.
   *Nota: npx nos ayuda a evitar el versionado, los problemas de dependencia y la instalación de paquetes innecesarios que sólo queremos probar.*
5. En Postgresql se creó una base de datos llamada `explorers_api`. Para crear la base de datos se uso el siguiente comando: `create database explorers_api;`.
6. Se debe modificar el archivo `.env` colocando el usuario y password:
   `DATABASE_URL="postgresql://TUUSUARIO:PASSWORD@localhost:5432/explorers_api?schema=public"`

   Este archivo hará posible la conexión a la db. Por defecto, Postgresql nos brinda el usuario `postgres` y el password es el que se agregó al momento de la instalación.
7. En el archivo `prisma/schema.prisma` se agregó un nuevo modelo Explorer:

```
    model Explorer {
        id Int @id @default(autoincrement())
        name String @unique
        username String @db.VarChar(255)
        mission String @db.VarChar(255)
        azureCertification Boolean @default(false)
        dateCreated DateTime @default(now())
        lastUpdated DateTime @updatedAt
    }
```

    Esta es la forma de declarar una nueva tabla en nuestra db.

8. Se versiona el nuevo modelo como nuevo cambio en nuestra base de datos, al versionamiento de los cambios de db se les llama `migrations`. Para esto se debe de ejecutar el siguiente comando: `npx prisma migrate dev --name init`. Al terminar de ejecutar el comando se creó la primera tabla de SQL usando prisma. Esto se puede comprobar revisando la tabla de la base de datos. También se crea la carpeta `prisma/migrations` que contiene un archivo SQL con el código en SQL de la tabla creada, este código es autogenerado.
   ![Comprobación de la tabla Explorer](./images/01-comprobacionTabla.png "Comprobación de la tabla Explorer")
9. Después se creó un archivo `prisma/seed.js`, en este archivo se pueden crear datos para insertarlos de forma automatizada a la db. A continuación se muestra el código necesario para insertar registros a la db:
   Código de `seed.js`

```
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    (async function main() {
    try {
        const woopa = await prisma.explorer.upsert({
        where: { name: 'Woopa' },
        update: {},
        create: {
            name: 'Woopa',
                    username: 'ajolonauta',
                    mission: 'Node'
        },
        });

        const woopa1 = await prisma.explorer.upsert({
        where: { name: 'Woopa1' },
        update: {},
        create: {
            name: 'Woopa1',
                    username: 'ajolonauta1',
                    mission: 'Node'
        },
        });

        const woopa2 = await prisma.explorer.upsert({
        where: { name: 'Woopa 2' },
        update: {},
        create: {
            name: 'Woopa 2',
                    username: 'ajolonauta2',
                    mission: 'Java'
        },
        });

        const woopa3 = await prisma.explorer.upsert({
        where: { name: 'Woopa 3' },
        update: {},
        create: {
            name: 'Woopa 3',
                    username: 'ajolonauta3',
                    mission: 'Node'
        },
        });

        console.log('Create 3 explorers');
    } catch(e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
    })();
```

10. Para crear los registros se debe de ejecutar el comando `node prisma/seed.js`. Una vez terminado el proceso ingresamos a la línea de comando de postgresql, ejecutamos el comando `select * from public."Explorer";` para verificar si los registros se han agregado a la tabla.
    ![Verificación de los registros creados](./images/02-verificacionRegistros.png "Verificación de los registros creados")

## Parte 2: CRUD

* Para este parte del proyecto se creó un archivo llamado `server.js` y dentro se creó un server básico de express agregando el cliente de Prisma. Para esto se ocupo el siguiente código:

```
    const express = require('express');
    const app = express();
    app.use(express.json());
    const port = process.env.PORT || 3000;

    // Require para usar Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    app.get('/', (req, res) => {
        res.json({message: 'alive'});
    });

    app.listen(port, () => {
        console.log(`Listening to requests on port ${port}`);
    });
```

* Así mismo para correr el server se ejecutó el siguiente comando `node server.js` y en el navegador se accedio a la url `localhost:3000`. Una vez dentro se verificó que recibimos el mensaje `alive`.
  ![Verificación del mensaje del server](./images/03-respuestaServer.png "Verificación del mensaje del server")

### API CRUD

1. Como primer paso se agregó un nuevo endpoint GET en el archivo `server.js` que permite regresar todos los explorers.

```
    app.get('/explorers', async (req, res) => {
        const allExplorers =  await prisma.explorer.findMany({});
        res.json(allExplorers);
    });
```

    Esto se puede probar con el siguiente url:`localhost:3000/explorers`

2. En este paso se agregó un nuevo endpoint de tipo GET que permite regresar el explorer al enviar un ID por query params a través del siguiente url: `localhost:3000/explorers/1`

```
    app.get('/explorers/:id', async (req, res) => {
        const id = req.params.id;
        const explorer = await prisma.explorer.findUnique({where: {id: parseInt(id)}});
        res.json(explorer);
    });
```

3. Después se agregó otro endpoint de tipo POST con el cual podremos crear nuevos explorers.

```
    app.post('/explorers', async (req, res) => {
        const explorer = {
            name: req.body.name,
            username: req.body.username,
            mission: req.body.mission
        };
        const message = 'Explorer creado.';
        await prisma.explorer.create({data: explorer});
        return res.json({message});
    });
```

4. También se creó otro endpoint de tipo PUT, el cuál recibe el ID del explorer a actualizar y en el cuerpo del request los campos a actualizar. En este ejemplo solo se hará el update para el campo de mission.

```
    app.put('/explorers/:id', async (req, res) => {
        const id = parseInt(req.params.id);

        await prisma.explorer.update({
            where: {
                id: id
            },
            data: {
                username: req.body.username,
                mission: req.body.mission
            }
        })

        return res.json({message: "Actualizado correctamente"});
    });
```

5. Para concluir el CRUD se creó un endpoint de tipo DELETE para eliminar un explorer dado un ID por query params.

```
    app.delete('/explorers/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        await prisma.explorer.delete({where: {id: id}});
        return res.json({message: "Eliminado correctamente"});
    });
```

La url para la API será `localhost:3000/explorers`, en donde se podrá acceder por GET, POST, PUT y DELETE. Mediante la colección de Postman que se encuentra en el archivo `Explorers API.postman_collection.json` se pueden probar todos los endpoints. Así que el siguiente paso será probar los endpoints en Postman, cabe aclarar que para realizar esto se debe dejar correr el server en node.

***EndPoint GET all***
Damos clic en send y muestra como respuesta todos los explorers que se tienen en la base de datos.

![Respuesta del endpoint GET all en Postman](./images/04-respuesta-getAll.PNG "Respuesta del endpoint GET all en Postman")

***EndPoint GET by id***
En la parte donde se muestra la url se puede ir cambiando el ID de tal manera que se obtendrá dicha información. En este caso se espera obtener los datos del explorer con el ID 5.

![Respuesta del endpoint GET by ID en Postman](./images/05-respuesta-getByID.PNG "Respuesta del endpoint GET by ID en Postman")

***EndPoint POST Create explorer***
Para poder crear un nuevo registro de un explorer en el apartado de Body agregamos/cambiamos los valores que nos muestra y damos clic en send. Si todo esta correcto se mostrará como respuesta un mensaje de "Explorer creado". El campo ID no es necesario ponerlo ya que al momento de crear el model Explorer se declaró para que fuera autoincrementable y al campo azureCertification se le asigno por default el valor de false.

![Respuesta del endpoint GET by ID en Postman](./images/06-respuesta-postCreateExplorer.PNG "Respuesta del endpoint GET by ID en Postman")

Y de la misma manera se puede verificar revisando la tabla de la base de datos.

![Verificación del registro creado en la DB](./images/07-verificacion-registroCreadoPOST.PNG "Verificación del registro creado en la DB")

***EndPoint PUT Update explorer mission***
Para actualizar un registro en la url se debe de indicar el ID, en este caso será el ID del nuevo registro que se creó el cuál es el 12 y en el apartado de Body agregamos/cambiamos los valores que nos aparece, para esto hay que tener en cuenta que solo se están actualizando los campos `username` y `mission`, ya que en el endpoint de tipo PUT que se ha creado en el archivo `server.js` así se ha declarado, si quisieramos actualizar otros campos se tendrían que declarar en el endpoint directamente.

Damos clic en send y si todo esta correcto se mostrará como respuesta un mensaje de "Actualizado correctamente".

![Respuesta del endpoint PUT Update Explorer](./images/08-respuesta-putUpdateExplorer.PNG "Respuesta del endpoint PUT Update Explorer")

Así mismo para corroborar que el registro se actualizó correctamente se consulta la tabla de la DB.

![Verificación del registro actualizado en la DB](./images/09-verificacion-registroActualizadoPUT.PNG "Verificación del registro actualizado en la DB")

***EndPoint DELETE Remove explorer***
Para eliminar un registro se debe indicar el ID del explorer en la url, en este caso se eliminó el mismo registro que se creó anteriormente, el cuál tiene el ID 12. Damos clic en send y aparecerá un mensaje con la leyenda de "Eliminado correctamente".

![Respuesta del endpoint DELETE Remove Explorer](./images/10-respuesta-deleteRemoveExplorer.PNG "Respuesta del endpoint DELETE Remove Explorer")

Y por último, si se verifica la tabla de la DB ese registro ya no se encontrará.

## Agrega una nueva tabla y crea el API

Como último requisito de este proyecto se solicitó crear una nueva tabla y el API como anteriormente se realizó.

| Campo            | Tipo de Dato           |
| ---------------- | ---------------------- |
| id               | Integer (autogenerado) |
| name             | String                 |
| missionCommander | String                 |
| enrollments      | Integer                |
| hasCertification | Boolean                |

1. Como primer paso se creó el siguiente modelo dentro del archivo `schema.prisma`:
```
    model mission_commanders{
        id Int @id @default(autoincrement())
        name String @unique
        missionCommander String @db.VarChar(255)
        enrollments Int
        hasCertification Boolean @default(true)
        dateCreated DateTime @default(now())
        lastUpdated DateTime @updatedAt
    }
```
Y luego se ejecutó el comando `npx prisma migrate dev --name missionCommanders` para crear la migración, con el fin que se apliquen estos cambios en la DB.

![Verificación de la tabla creada mission_commanders](./images/11-comprobacionTabla_missionCommanders.PNG "Verificación de la tabla creada mission_commanders")

2. Se crearon datos para insertar a la tabla de forma automatizada, esto a través del archivo `seed.js`.
```
    (async function mission_commanders() {
        try {
            const missionCommander = await prisma.mission_commanders.upsert({
                where: { name: 'Rodrigo Martinez' },
                update: {},
                create: {
                    name: 'Rodrigo Martinez',
                    missionCommander: 'FrontEnd',
                    enrollments: 500
                },
            });
            
            const missionCommander1 = await prisma.mission_commanders.upsert({
                where: { name: 'Carlo Gilmar' },
                update: {},
                create: {
                    name: 'Carlo Gilmar',
                    missionCommander: 'Node',
                    enrollments: 250
                },
            });

            const missionCommander2 = await prisma.mission_commanders.upsert({
                where: { name: 'Fernanda Ochoa' },
                update: {},
                create: {
                    name: 'Fernanda Ochoa',
                    missionCommander: 'Java',
                    enrollments: 250
                },
            });

            console.log('Create 3 mission commanders');
        } catch (e) {
            console.error(e);
            process.exit(1);
        } finally {
            await prisma.$disconnect();
        }
    })();
```
Y con el comando `​node prisma/seed.js` se crearon los registros en la tabla de la DB. Los cuales son 3.

![Verificación de los registros creados en la tabla mission_commanders](./images/12-verificacion-registrosMissionCommanders.PNG "Verificación de los registros creados en la tabla mission_commanders")

3. Se creó un CRUD para esta tabla en el archivo `server.js`

***Endpoint GET para regresar todos los registros***
```
app.get('/missionCommander', async (req, res) => {
    const allMissionCommanders = await prisma.mission_commanders.findMany({});
    res.json(allMissionCommanders);
});
```
Desde el navegador se puede observar lo siguiente:

![Verificación endpoint GET para regresar todos los registros](./images/13-respuesta-GET-missionCommander.PNG "Verificación endpoint GET para regresar todos los registros")

***Endpoint GET para regresar el registro dado el ID***
```
app.get('/missionCommander/:id', async (req, res) => {
    const id = req.params.id;
    const mission_commander = await prisma.mission_commanders.findUnique({ where: { id: parseInt(id) } });
    res.json(mission_commander);
});
```
Para regresar el registro dado el ID también se puede realizar desde el navegador:

![Verificación endpoint GET para regresar el registro por ID](./images/14-respuesta_GetByID_missionCommander.PNG "Verificación endpoint GET para regresar el registro por ID")

***Endpoint POST para crear un nuevo registro***
```
app.post('/missionCommander', async (req, res) => {
    const mission_commander = {
        name: req.body.name,
        missionCommander: req.body.missionCommander,
        enrollments: req.body.enrollments
    };
    const message = 'Mission commander creado.';
    await prisma.mission_commanders.create({ data: mission_commander });
    return res.json({ message });
});
```

Para probar el endpoint de tipo de POST así como los posteriores, se creó y se hizo uso de la colección de Postman que se encuentra en el archivo `MissionCommander-API.postman_collection.json`. En este caso en el apartado del body ya se tienen los campos y valores por defectos así que solo se da clic en send y todo esta bien muestra una leyenda de "Mission commander creado".

![Respuesta del endpoint POST Create Mission Commander](./images/15-respuesta-postCreateMissionCommander.PNG "Respuesta del endpoint POST Create Mission Commander")

También se puede verificar en la tabla de la DB si el registro ha sido creado.

***Endpoint PUT para actualizar un registro***
```
app.put('/missionCommander/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    await prisma.mission_commanders.update({
        where: {
            id: id
        },
        data: {
            name: req.body.name,
            missionCommander: req.body.missionCommander,
            enrollments: req.body.enrollments
        }
    })

    return res.json({ message: "Actualizado correctamente" });
});
```

Para actualizar los registros de un mission commander, en este caso será el que se acaba de crear en la url se debe de indicar el ID del mission commander y actualizar el registro. Los campos que solo se actualizarán serán `missionCommander` y `enrollments`. Después, solo se da clic en send y si todo está correcto aparecerá una leyenda de "Actualizado correctamente". 

![Respuesta del endpoint PUT Update Mission Commander](./images/16-respuesta-putUpdateMissionCommander.PNG "Respuesta del endpoint PUT Updat Mission Commander")

Y de la misma forma se puede verificar en la base datos si los registros se actualizarón.

***Endpoint DELETE para eliminar un registro***
```
app.delete('/missionCommander/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma.mission_commanders.delete({ where: { id: id } });
    return res.json({ message: "Eliminado correctamente" });
});
```

Por último, para probar este endpoint se eliminó el registro que se creó con el endpoint POST. Para esto en la url se debe de indicar el ID a eliminar, en este caso es el número 4. Si todo esta bien aparece la leyenda "Eliminado correctamente".

![Respuesta del endpoint DELETE Remove Mission Commander](./images/17-respuesta-deleteMissionCommander.PNG "Respuesta del endpoint DELETE Remove Mission Commander")

Y de la misma manera, para verificar que los datos han sido borrados podemos ingresar a la tabla de la DB.
