// @ts-ignore
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@services/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { from, to, sentence } = req.query;
	const idSentenceFrom = await prisma.$queryRaw`SELECT b.id FROM "public"."Bahasa" b 
													INNER JOIN "public"."Daerah" d ON (b."idDaerah"=d.id)
													WHERE d.nama ilike ${from} AND b.kalimat ilike ${sentence}`;
	const searchTranslate1 = await prisma.$queryRaw`SELECT dtd."idBahasa2" FROM "public"."DaerahToDaerah" dtd 
													WHERE dtd."idBahasa1" = ${idSentenceFrom[0].id}`;
	const searchTranslate2 = await prisma.$queryRaw`SELECT dtd."idBahasa1" FROM "public"."DaerahToDaerah" dtd 
													WHERE dtd."idBahasa2" = ${idSentenceFrom[0].id}`;

	if (searchTranslate1.idBahasa2) {
		const translated = await prisma.$queryRaw`SELECT b.id, b.kalimat as "translate" FROM "public"."Bahasa" b 
													INNER JOIN "public"."Daerah" d ON (b."idDaerah"=d.id)
													WHERE d.nama ilike ${to} AND b.id=${searchTranslate1.idBahasa2}`;
		return res.status(200).json({
			status: "success",
			kalimat: sentence,
			translate: translated,
		});
	} else if (searchTranslate2.idBahasa1) {
		const translated = await prisma.$queryRaw`SELECT b.id, b.kalimat as "translate" FROM "public"."Bahasa" b 
													INNER JOIN "public"."Daerah" d ON (b."idDaerah"=d.id)
													WHERE d.nama ilike ${to} AND b.id=${searchTranslate2.idBahasa1}`;
		return res.status(200).json({
			status: "success",
			kalimat: sentence,
			translate: translated,
		});
	}

	res.status(404).json({
		status: "fail",
		result: "Not Found",
	});
	return;
}
