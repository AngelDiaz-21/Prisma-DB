const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Require para usar Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.get('/', (req, res) => {
    res.json({ message: 'alive' });
});

app.listen(port, () => {
    console.log(`Listening to requests on port ${port}`);
});

app.get('/explorers', async (req, res) => {
    const allExplorers = await prisma.explorer.findMany({});
    res.json(allExplorers);
});

app.get('/explorers/:id', async (req, res) => {
    const id = req.params.id;
    const explorer = await prisma.explorer.findUnique({ where: { id: parseInt(id) } });
    res.json(explorer);
});

app.post('/explorers', async (req, res) => {
    const explorer = {
        name: req.body.name,
        username: req.body.username,
        mission: req.body.mission
    };
    const message = 'Explorer creado.';
    await prisma.explorer.create({ data: explorer });
    return res.json({ message });
});

app.put('/explorers/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    await prisma.explorer.update({
        where: {
            id: id
        },
        data: {
            username: req.body.username,
            mission: req.body.mission,
        }
    })

    return res.json({ message: "Actualizado correctamente" });
});

app.delete('/explorers/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma.explorer.delete({ where: { id: id } });
    return res.json({ message: "Eliminado correctamente" });
});

// table/model mission_commander
app.get('/missionCommander', async (req, res) => {
    const allMissionCommanders = await prisma.mission_commanders.findMany({});
    res.json(allMissionCommanders);
});

app.get('/missionCommander/:id', async (req, res) => {
    const id = req.params.id;
    const mission_commander = await prisma.mission_commanders.findUnique({ where: { id: parseInt(id) } });
    res.json(mission_commander);
});

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

app.delete('/missionCommander/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma.mission_commanders.delete({ where: { id: id } });
    return res.json({ message: "Eliminado correctamente" });
});