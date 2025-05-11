# Systémová príručka AI Voice Assistant Platform

## Obsah
1. [Úvod](#úvod)
2. [Architektúra systému](#architektúra-systému)
3. [Serverové komponenty](#serverové-komponenty)
   - [main.py - Hlavný server](#mainpy---hlavný-server)
   - [knowledge_indexer.py - Indexovanie znalostí](#knowledge_indexerpy---indexovanie-znalostí)
   - [rag_manager.py - RAG manažér](#rag_managerpy---rag-manažér)
   - [transcript_processor.py - Spracovanie prepisov](#transcript_processorpy---spracovanie-prepisov)
   - [api.py - REST API](#apipy---rest-api)
4. [Asistenti](#asistenti)
   - [Landing Page asistent](#landing-page-asistent)
   - [Onboarding asistent](#onboarding-asistent)
   - [Generovaný asistent](#generovaný-asistent)
   - [Improvement asistent](#improvement-asistent)
5. [Systém transkripcií](#systém-transkripcií)
6. [RAG (Retrieval-Augmented Generation)](#rag-retrieval-augmented-generation)
7. [Adresárová štruktúra](#adresárová-štruktúra)

## Úvod

Táto systémová príručka poskytuje detailný prehľad o komponentoch a funkcionalitách AI Voice Assistant Platform. Platforma umožňuje vytvárať, testovať a nasadzovať hlasových asistentov s využitím moderných AI technológií. Systém kombinuje LiveKit pre real-time komunikáciu, OpenAI modely pre spracovanie jazyka a vlastný RAG (Retrieval-Augmented Generation) systém pre rozšírenie znalostí asistentov.

## Architektúra systému

Systém je postavený na viacvrstvovej architektúre:

1. **Backend Server** - Python aplikácia s LiveKit integrovanou s OpenAI API
2. **RAG System** - Vektorová databáza pre kontextové vyhľadávanie znalostí
3. **Transcript Processing** - Automatické spracovanie prepisov konverzácií
4. **REST API** - Rozhranie pre komunikáciu s frontendovou aplikáciou
5. **Voice Assistants** - Špecializovaní hlasoví asistenti pre rôzne úlohy

Systém používa asynchrónne spracovanie pre efektívne zvládnutie viacerých súbežných požiadaviek a konverzácií.

## Serverové komponenty

### main.py - Hlavný server

Hlavný súbor servera, ktorý zabezpečuje:

- **Inicializáciu systému** - Nastavenie adresárov, kontrola závislostí, načítanie RAG systému
- **LiveKit Worker** - Konfigurácia a spustenie LiveKit workera pre hlasové spojenia
- **Transkripčný procesor** - Spustenie na pozadí pre spracovanie nových prepisov
- **Flask API server** - Inicializácia API endpointov

**Kľúčové funkcie:**

#### `initialize_directories()`
Vytvára požadované adresáre pre systém:
- transcripts/ - Priečinok pre prepisy konverzácií
- knowledgebase/ - Priečinok pre znalostné súbory
- rag_index/ - Priečinok pre vektorovú databázu
- generated_prompts/ - Priečinok pre vygenerované prompty

#### `check_knowledgebase_updates(force_update=False)`
Kontroluje, či pribudli nové súbory v znalostnej databáze a aktualizuje RAG index:
- Volá `run_indexer()` pre zistenie zmien
- Pri zmenách reloaduje RAG manažéra pre aktuálne znalosti
- S parametrom `force_update=True` vykoná aktualizáciu bez ohľadu na zmeny

#### `init_rag_system()`
Inicializuje RAG systém:
- Kontroluje priečinky a súbory
- Overuje existenciu znalostných súborov
- Načítava alebo vytvára vektorovú databázu

#### `TranscriptionAssistant`
Rozšírená trieda `VoiceAssistant` z LiveKit, ktorá poskytuje:
- Zachytávanie a ukladanie prepisov konverzácií
- Sledovanie stavu konverzácie (počúvanie, rozprávanie, spracovanie)
- Ukladanie prepisov do markdown súborov v príslušných priečinkoch

#### `create_landingpage_assistant(ctx)`
Vytvára asistenta pre landing page:
- Inicializácia asistenta s OpenAI modelmi
- Nastavenie osobnosti a správania
- Konfigurácia transkripčných funkcií

#### `create_onboarding_assistant(ctx)`
Vytvára asistenta pre onboarding proces:
- Inicializácia asistenta s iným štýlom a hlasom
- Nastavenie na zber požiadaviek pre nového asistenta
- Sledovanie konverzácie pre neskoršie generovanie asistenta

#### `create_landingpage_assistant_with_rag(ctx)` a `create_onboarding_assistant_with_rag(ctx)`
Vytvára asistentov s RAG schopnosťami:
- Inicializácia s `before_llm_cb=rag_manager.enrich_chat_context`
- Umožňujú získavať kontext zo znalostnej databázy

#### `create_generated_assistant(ctx)`
Vytvára asistenta podľa vygenerovaného promptu:
- Načíta dynamicky vygenerovaný prompt a prvú správu
- Nastavuje vybraný hlas
- Používa RAG pre rozšírenie znalostí

#### `create_improvement_assistant(ctx)`
Vytvára asistenta pre zlepšovanie existujúceho asistenta:
- Analyzuje posledný prepis konverzácie s generovaným asistentom
- Umožňuje zbierať spätnú väzbu na vylepšenie

#### `entrypoint(ctx)`
Hlavná funkcia pre LiveKit worker:
- Detekuje typ miestnosti z názvu
- Spúšťa príslušný typ asistenta
- Kontroluje RAG dostupnosť

### knowledge_indexer.py - Indexovanie znalostí

Modul zodpovedný za spracovanie a indexovanie znalostných súborov:

**Kľúčové funkcie:**

#### `process_knowledge_file(file_path, idx_builder, paragraphs_by_uuid, http_session)`
Spracuje jeden súbor znalostnej databázy:
- Detekuje typ súboru (.txt, .pdf)
- Extrahuje text z PDF dokumentov
- Rozdelí obsah na paragrafy
- Generuje embeddingy pre každý paragraf
- Pridáva paragrafy do vektorovej databázy

#### `extract_text_from_pdf(file_path)`
Extrahuje text z PDF súborov:
- Používa `PdfReader` z knižnice pypdf
- Spája text zo všetkých stránok dokumentu

#### `main()`
Hlavná funkcia pre indexovanie:
- Načítava zoznam spracovaných súborov
- Identifikuje nové súbory na spracovanie 
- Volá `process_knowledge_file` pre každý nový súbor
- Ukladá aktualizovaný index a paragrafy

#### `run_indexer()`
Spúšťa indexovanie a vracia informáciu o aktualizácii:
- Vracia `True` ak prebehla aktualizácia, inak `False`

### rag_manager.py - RAG manažér

Modul zabezpečujúci Retrieval-Augmented Generation funkcionalitu:

**Kľúčové funkcie:**

#### `load()`
Načítava vektorový index a znalostné paragrafy:
- Kontroluje existenciu potrebných súborov
- Načítava Annoy index pre vektorovú databázu
- Načítava paragrafy a ich metadata

#### `generate_embedding(text)`
Generuje embedding pre vstupný text:
- Využíva OpenAI embedding model
- Používa model "text-embedding-3-small"

#### `retrieve_context(query, max_results=3)`
Vyhľadáva relevantný kontext pre danú otázku:
- Generuje embedding pre otázku
- Hľadá podobné paragrafy vo vektorovej databáze
- Vracia združený kontext z najviac relevantných paragrafov

#### `enrich_chat_context(agent, chat_ctx)`
Rozširuje konverzačný kontext s relevantnými znalosťami:
- Analyzuje poslednú správu používateľa
- Vyhľadáva relevantný kontext pomocou `retrieve_context`
- Vkladá kontext do konverzácie pre asistenta

### transcript_processor.py - Spracovanie prepisov

Modul zabezpečujúci automatické spracovanie prepisov konverzácií:

**Kľúčové funkcie:**

#### `process_new_transcripts()`
Hľadá a spracováva nové prepisy:
- Vyhľadáva nespracované prepisy v rôznych priečinkoch
- Spracováva onboarding prepisy generovaním promptov
- Spracováva improvement prepisy aktualizáciou promptov
- Označuje spracované súbory

#### `_generate_prompt_with_gpt4o(transcript_content)`
Generuje prompt pre asistenta na základe prepisu:
- Používa GPT-4o model pre analýzu prepisu
- Vytvára štruktúrovaný prompt s identitou, osobnosťou a konverzačným tokom

#### `_generate_first_message(transcript_content)`
Generuje prvú správu asistenta na základe prepisu:
- Vytvára uvítaciu správu pre nového asistenta
- Zabezpečuje tón a obsah zodpovedajúci požadovanému asistentovi

#### `_generate_improved_prompt(transcript_content, current_prompt)`
Aktualizuje existujúci prompt na základe spätnej väzby:
- Analyzuje prepis so spätnou väzbou
- Modifikuje existujúci prompt podľa požiadaviek
- Zachováva štruktúru a formát promptu

#### `_generate_improved_first_message(transcript_content, current_prompt, current_first_message)`
Aktualizuje prvú správu na základe spätnej väzby:
- Analyzuje prepis so spätnou väzbou
- Upravuje prvú správu podľa požiadaviek
- Zabezpečuje súlad s aktualizovaným promptom

### api.py - REST API

Modul zabezpečujúci REST API pre komunikáciu s frontendovou aplikáciou:

**Kľúčové endpointy:**

#### `/api/process-knowledgebase` (POST)
Spúšťa spracovanie znalostnej databázy:
- Volá `run_indexer()` pre aktualizáciu databázy
- Reloaduje RAG manažér pri zmenách
- Vracia statusy o úspechu alebo chybách spracovania

## Asistenti

### Landing Page asistent

**Účel:** Prvý kontakt s používateľom, predstavenie platformy.

**Vlastnosti:**
- Vysvetľuje základné funkcionality platformy
- Odpovedá na otázky o možnostiach a výhodách
- Naviguje používateľa k ďalším krokom

### Onboarding asistent

**Účel:** Zbiera požiadavky pre vytvorenie nového hlasového asistenta.

**Vlastnosti:**
- Kladie systematické otázky o požadovanom asistentovi
- Zbiera informácie o účele, tóne, osobnosti asistenta
- Generuje podklady pre vytvorenie promptu

### Generovaný asistent

**Účel:** Funguje ako vytvorený hlasový asistent podľa požiadaviek používateľa.

**Vlastnosti:**
- Používa dynamicky vygenerovaný prompt a prvú správu
- Využíva vybranú hlasovú identitu
- Aplikuje znalosti z RAG systému

### Improvement asistent

**Účel:** Zbiera spätnú väzbu a vylepšenia pre existujúceho asistenta.

**Vlastnosti:**
- Analyzuje predchádzajúce konverzácie
- Zachytáva požiadavky na zmeny a vylepšenia
- Aktualizuje prompt a prvú správu asistenta

## Systém transkripcií

Systém zabezpečuje:
- Zachytávanie a ukladanie prepisov konverzácií
- Automatické kategorizovanie prepisov do príslušných priečinkov
- Formátovanie prepisov do markdown dokumentov
- Spracovanie prepisov na generovanie promptov a správ

**Kategórie prepisov:**
- landing/ - Prepisy z landing page asistenta
- onboarding/ - Prepisy z onboarding rozhovorov
- generated_agent/ - Prepisy z konverzácií s vygenerovaným asistentom
- alice_improvement/ - Prepisy z improvement konverzácií
- other/ - Ostatné prepisy

## RAG (Retrieval-Augmented Generation)

RAG systém rozširuje znalosti asistentov o externé informácie:

**Komponenty:**
- **Knowledgebase** - Priečinok so zdrojovými TXT a PDF súbormi
- **Indexer** - Spracováva súbory a generuje embeddingy
- **Vector Database** - Ukladá embeddingy pre efektívne vyhľadávanie
- **RAG Manager** - Zabezpečuje integráciu s asistentmi

**Proces:**
1. Indexer spracuje znalostné súbory na paragrafy
2. Pre každý paragraf sa vygeneruje embedding
3. Embeddingy sa uložia do vektorovej databázy
4. Pri konverzácii sa hľadá relevantný kontext
5. Nájdený kontext sa pridá do konverzácie s asistentom

## Adresárová štruktúra

```
Backend/
├── api.py                      # REST API implementácia
├── custom_rag.py               # Vlastná RAG implementácia
├── knowledge_indexer.py        # Indexovanie znalostnej databázy
├── main.py                     # Hlavný server
├── rag_manager.py              # Manažér RAG systému
├── transcript_processor.py     # Spracovanie prepisov
├── requirements.txt            # Požiadavky na knižnice
├── transcripts/                # Prepisy konverzácií
│   ├── landing/                # Prepisy z landing page
│   ├── onboarding/             # Prepisy z onboardingu
│   ├── generated_agent/        # Prepisy z generovaného asistenta
│   ├── alice_improvement/      # Prepisy z vylepšovania
│   └── other/                  # Ostatné prepisy
├── knowledgebase/              # Zdrojové znalostné súbory
├── rag_index/                  # Vektorová databáza a metadáta
│   ├── vdb_data                # Dáta vektorovej databázy
│   ├── knowledge_data.pkl      # Paragrafy textu
│   ├── last_updated.txt        # Časové značky aktualizácií
│   └── processed_files.txt     # Zoznam spracovaných súborov
├── generated_prompts/          # Vygenerované prompty a správy
│   ├── current_voice_agent_prompt.md  # Aktuálny prompt
│   ├── first_message.txt       # Prvá správa asistenta
│   └── processed_files.json    # Spracované prepisy
└── assistant_setup/            # Nastavenia asistentov
    └── selected_voice.txt      # Vybraný hlas
```

Táto systémová príručka poskytuje prehľad o všetkých komponentoch AI Voice Assistant Platform. Pre viac detailov o konkrétnych implementačných aspektoch odporúčame preštudovať zdrojový kód jednotlivých modulov.