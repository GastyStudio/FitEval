import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clientes = await prisma.client.findMany({
      include: { evaluation: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(clientes);
  } catch (error) {
    console.error("Error al traer clientes:", error);
    return Response.json({ error: "Error al traer clientes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const datos = await request.json();

    // Crear trainer por defecto si no existe
await prisma.trainer.upsert({
  where:  { email: "trainer@fiteval.com" },
  update: {},
  create: {
    id:       "trainer-default",
    email:    "trainer@fiteval.com",
    name:     "Trainer",
    password: "default",
  },
});
    const cliente = await prisma.client.create({
      data: {
        firstName:   datos.firstName,
        lastName:    datos.lastName,
        age:         parseInt(datos.age),
        sex:         datos.sex,
        weight:      parseFloat(datos.weight),
        height:      parseFloat(datos.height),
        objetivo:    datos.objetivo,
        experiencia: datos.experiencia,
        lesiones:    datos.lesiones || null,
        trainerId:   "trainer-default",
        evaluation: {
          create: {
            flexiones:     parseInt(datos.flexiones)     || 0,
            sentadilla:    parseInt(datos.sentadilla)    || 0,
            dominadas:     parseInt(datos.dominadas)     || 0,
            plancha:       parseInt(datos.plancha)       || 0,
            esGimnasio:    datos.esGimnasio || false,
            banca:         datos.banca          ? parseInt(datos.banca)          : null,
            sentadillaGym: datos.sentadillaGym  ? parseInt(datos.sentadillaGym)  : null,
            pesoMuerto:    datos.pesoMuerto     ? parseInt(datos.pesoMuerto)     : null,
            remo:          datos.remo           ? parseInt(datos.remo)           : null,
            nivelFlex:       datos.nivelFlex       || "principiante",
            nivelSent:       datos.nivelSent       || "principiante",
            nivelDom:        datos.nivelDom        || "principiante",
            nivelPlancha:    datos.nivelPlancha    || "principiante",
            nivelBanca:      datos.nivelBanca      || null,
            nivelSentGym:    datos.nivelSentGym    || null,
            nivelPesoMuerto: datos.nivelPesoMuerto || null,
            nivelRemo:       datos.nivelRemo       || null,
            nivelGeneral:    datos.nivelGeneral    || "principiante",
            imc:             parseFloat(datos.imc) || 0,
            frecuencia:      parseInt(datos.frecuencia) || 3,
          },
        },
      },
      include: { evaluation: true },
    });

    return Response.json(cliente, { status: 201 });

  } catch (error) {
  console.error("Error detallado:", JSON.stringify(error, null, 2));
  console.error("Mensaje:", error.message);
  return Response.json({ error: "Error al crear cliente" }, { status: 500 });
}
}