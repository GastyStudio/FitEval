import { prisma } from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    const cliente = await prisma.client.findUnique({
      where: { id },
      include: { evaluation: true },
    });

    if (!cliente) {
      return Response.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return Response.json(cliente);

  } catch (error) {
    console.error("Error al traer cliente:", error);
    return Response.json({ error: "Error al traer cliente" }, { status: 500 });
  }
}