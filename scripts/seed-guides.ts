import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Guide, GuideSchema } from '../src/guides/schemas/guide.schema';

dotenv.config();

const guides = [
  {
    title: 'Cutremur',
    category: 'CUTREMUR',
    summary:
      'Ce faci inainte, in timpul si dupa un cutremur, ca sa reduci riscul de accidentare.',
    version: 1,
    sections: [
      {
        heading: 'Inainte',
        items: [
          'Identifica locurile sigure din locuinta: sub o masa solida, langa un perete interior, departe de geamuri si mobila inalta.',
          'Fixeaza mobila inalta si obiectele grele de perete.',
          'Pregateste un kit de urgenta: apa, lanterna, baterii, trusa medicala, copii dupa acte.',
          'Stabileste cu familia un punct de intalnire in afara locuintei.',
        ],
      },
      {
        heading: 'In timpul cutremurului',
        items: [
          'Stai jos, acopera-te si tine-te bine (Drop, Cover, Hold On).',
          'Daca esti in pat, ramai acolo si acopera-ti capul cu o perna.',
          'Nu folosi liftul.',
          'Daca esti afara, indeparteaza-te de cladiri, stalpi si cabluri electrice.',
          'Daca conduci, opreste masina intr-un loc deschis si ramai inauntru.',
        ],
      },
      {
        heading: 'Dupa cutremur',
        items: [
          'Verifica-te pe tine si pe cei din jur pentru raniri.',
          'Ai grija la replici.',
          'Verifica scurgeri de gaz sau avarii electrice inainte de a folosi flacara deschisa.',
          'Paraseste cladirea daca observi fisuri structurale.',
        ],
      },
    ],
  },
  {
    title: 'Incendiu',
    category: 'INCENDIU',
    summary: 'Cum reactionezi in cazul unui incendiu, in locuinta sau in spatii publice.',
    version: 1,
    sections: [
      {
        heading: 'Daca observi un incendiu',
        items: [
          'Suna imediat la 112.',
          'Alerteaza persoanele din jur si ajuta la evacuare.',
          'Nu folosi liftul, foloseste scarile.',
          'Daca exista fum, mergi aplecat, mai aproape de podea.',
        ],
      },
      {
        heading: 'Daca esti blocat',
        items: [
          'Inchide usa camerei si astupa cu haine umede spatiile de sub usa.',
          'Semnalizeaza-ti pozitia la fereastra.',
          'Nu sari pe fereastra decat in ultima instanta.',
        ],
      },
    ],
  },
  {
    title: 'Inundatie',
    category: 'INUNDATIE',
    summary: 'Masuri de siguranta inainte si in timpul unei inundatii.',
    version: 1,
    sections: [
      {
        heading: 'Inainte',
        items: [
          'Muta obiectele de valoare si actele importante la etaj sau in locuri inalte.',
          'Opreste alimentarea cu gaz si electricitate daca autoritatile recomanda evacuarea.',
        ],
      },
      {
        heading: 'In timpul inundatiei',
        items: [
          'Nu traversa apa in miscare, nici pe jos, nici cu masina.',
          'Muta-te la un etaj superior daca apa patrunde in locuinta.',
          'Urmareste anunturile autoritatilor locale.',
        ],
      },
    ],
  },
  {
    title: 'Fenomene meteo extreme',
    category: 'METEO_EXTREM',
    summary: 'Cum te protejezi in cazul furtunilor, viscolului sau valurilor de caldura.',
    version: 1,
    sections: [
      {
        heading: 'Furtuna / vijelie',
        items: [
          'Evita zonele deschise, copacii si structurile inalte.',
          'Asigura obiectele care pot fi luate de vant (mobilier de gradina, etc.).',
        ],
      },
      {
        heading: 'Val de caldura',
        items: [
          'Hidrateaza-te constant, evita efortul fizic in orele de varf.',
          'Evita expunerea directa la soare intre 12:00 si 18:00.',
        ],
      },
    ],
  },
  {
    title: 'Reguli generale in situatii de urgenta',
    category: 'GENERAL',
    summary: 'Principii valabile indiferent de tipul de urgenta.',
    version: 1,
    sections: [
      {
        heading: 'Reguli de baza',
        items: [
          'Pastreaza-ti calmul si evalueaza situatia inainte sa actionezi.',
          'Suna la 112 pentru orice urgenta care pune viata in pericol.',
          'Urmareste anunturile oficiale, nu zvonurile.',
          'Ai pregatit un kit minim de urgenta acasa.',
        ],
      },
    ],
  },
];

async function seed() {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    throw new Error('ATLAS_URI nu este setat in .env');
  }

  await mongoose.connect(uri, {
    dbName: process.env.ATLAS_DB_NAME ?? 'alerta-nationala-proiect',
  });

  const GuideModel = mongoose.model(Guide.name, GuideSchema);

  await GuideModel.deleteMany({});
  await GuideModel.insertMany(guides);

  console.log(`Am adaugat ${guides.length} ghiduri.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});