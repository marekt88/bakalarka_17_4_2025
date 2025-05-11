# Technická dokumentácia frontendu - VoiceForge AI Platform

## 1. Úvod

Táto dokumentácia popisuje frontend časť platformy VoiceForge AI, ktorá slúži na vytváranie hlasových agentov s využitím RAG (Retrieval-Augmented Generation) technológie. Frontend je zodpovedný za poskytnutie používateľského rozhrania pre interakciu s hlasovými asistentmi, správu znalostnej bázy a testovanie vytvorených agentov.

## 2. Technologický základ

### Použité technológie

- **Next.js** - React framework s podporou serverových komponentov, API routes a optimalizáciou renderovania
- **TypeScript** - Typový systém pre JavaScript, ktorý zvyšuje kvalitu a udržateľnosť kódu
- **TailwindCSS** - Utility-first CSS framework pre rýchle vytváranie responsívnych UI komponentov
- **LiveKit** - SDK pre real-time audio a video komunikáciu cez WebRTC
- **Framer Motion** - Knižnica pre animácie v React aplikáciách
- **Lucide** - Kolekcia ikon používaná v celom UI

### Adresárová štruktúra

```
AI-voice-agent-platform-frontend/
├── app/                  # Next.js aplikačné stránky a API routes
│   ├── api/              # Backend API endpointy pre frontend
│   └── [routes]/         # Jednotlivé stránky aplikácie
├── components/           # React komponenty
├── hooks/                # Custom React hooks
├── lib/                  # Zdieľané utility
└── public/               # Statické súbory
```

## 3. Kľúčové komponenty

### 3.1 UnifiedVoiceAgent

**Súbor**: `components/UnifiedVoiceAgent.tsx`

Centrálny komponent pre prácu s hlasovými agentmi, ktorý poskytuje jednotné rozhranie pre všetky typy asistentov. Komponent zastrešuje:

- Pripojenie k LiveKit serveru pre real-time audio komunikáciu
- Správu stavu hlasového agenta (disconnected, connecting, listening, speaking, processing)
- Vizuálnu reprezentáciu stavu hlasového agenta
- Mechanizmy na riešenie chybových stavov (timeout notifikácie)

**Použitie**:
```tsx
<UnifiedVoiceAgent 
  assistantName="ALICE" 
  assistantType="onboarding" 
  className="max-w-2xl mx-auto" 
/>
```

**Props**:
- `assistantName` - Meno hlasového asistenta (predvolené: "ALICE")
- `assistantType` - Typ asistenta ("landing", "onboarding", "improvement")
- `className` - CSS triedy pre styling
- `isProcessingFeedback` - Boolean hodnota indikujúca, či asistent spracováva spätnú väzbu

### 3.2 SimpleVoiceAssistant

**Súbor**: `components/SimpleVoiceAssistant.tsx`

Zjednodušená verzia hlasového asistenta, ktorá poskytuje minimalistické vizuálne rozhranie pomocou jednoduchej animácie bodiek. Navrhnutá pre menej náročné použitie.

**Hlavné funkcie**:
- Zobrazuje aktuálny stav asistenta pomocou farebne kódovaných animovaných bodiek
- Poskytuje textovú informáciu o aktuálnom stave asistenta

### 3.3 VoiceControlPanel

**Súbor**: `components/VoiceControlPanel.tsx`

Komponent pre ovládacie prvky hlasového asistenta. Zobrazuje tlačidlá pre pripojenie/odpojenie a ovládanie mikrofónu.

**Hlavné funkcie**:
- Tlačidlo pre pripojenie k asistentovi v stave "disconnected"
- Ovládacie prvky pre stlmenie, zastavenie a odpojenie v pripojenom stave
- Animované prechody medzi stavmi pomocou Framer Motion

### 3.4 AgentProcessingOverlay

**Súbor**: `components/AgentProcessingOverlay.tsx`

Overlay komponent zobrazujúci sa počas spracovania zmien v agentovi, napríklad pri aplikovaní spätnej väzby. Poskytuje používateľovi vizuálnu spätnú väzbu počas čakania.

### 3.5 NoAgentNotification

Komponent zobrazujúci notifikáciu, keď sa asistent nemôže pripojiť alebo nastane timeout pri pripájaní.

## 4. Komunikácia s backendom

### 4.1 API Route pre pripojenie k hlasovému asistentovi

**Súbor**: `app/api/connection-details/route.ts`

Tento endpoint generuje pripojenie k LiveKit serveru a vytvára token pre autentifikáciu používateľa. Je kľúčovým bodom prepojenia medzi frontendovým UI a backendom implementujúcim hlasového asistenta.

**Funkčnosť**:
1. Generuje náhodný identifikátor používateľa a názov miestnosti
2. Vytvára JWT token s oprávneniami pre danú miestnosť
3. Vracia objekty potrebné pre pripojenie k LiveKit serveru:
   - `serverUrl` - URL LiveKit servera
   - `roomName` - Názov vytvorenej miestnosti
   - `participantToken` - JWT token pre autentifikáciu
   - `participantName` - Identita používateľa

**Požiadavky**:
- HTTP GET s volitelnými parametrami:
  - `assistant` - meno asistenta (predvolené: "default")
  - `type` - typ asistenta (predvolené: "landing")

**Odpoveď**: JSON objekt s pripojovacími údajmi:
```json
{
  "serverUrl": "wss://example.livekit.cloud",
  "roomName": "alice_onboarding_room_1234",
  "participantToken": "eyJhbGciOiJIUzI1...",
  "participantName": "user_5678"
}
```

### 4.2 Ďalšie API Route endpointy

Frontend obsahuje aj ďalšie API endpointy pre komunikáciu s backendom:
- `/api/get-prompt-content` - Získanie aktuálneho promtu pre asistenta
- `/api/get-first-message` - Získanie úvodnej správy pre asistenta
- `/api/save-voice` - Uloženie vybraného hlasu pre asistenta

## 5. Integrácia s LiveKit

Platforma využíva LiveKit SDK pre real-time audio komunikáciu. Integrácia je implementovaná nasledovne:

### 5.1 LiveKitRoom komponent

Hlavný komponent, ktorý sa stará o WebRTC spojenie, audio streamy a komunikáciu so serverom. Je obalený v `UnifiedVoiceAgent` komponente.

```tsx
<LiveKitRoom
  token={connectionDetails?.participantToken}
  serverUrl={connectionDetails?.serverUrl}
  connect={connectionDetails !== undefined}
  audio={true}
  video={false}
  onMediaDeviceFailure={onDeviceFailure}
  onDisconnected={handleDisconnect}
  data-lk-theme="default"
  className="rounded-xl p-6 bg-[#0A0118]/50"
>
  {/* Komponenty pre audio renderovanie a stavový tracking */}
</LiveKitRoom>
```

### 5.2 RoomAudioRenderer

Komponent, ktorý sa stará o renderovanie audio streamov z miestnosti. Automaticky spracováva všetky publikované audio tracky a prehráva ich.

### 5.3 useVoiceAssistant Hook

Custom React hook z LiveKit SDK, ktorý poskytuje prístup k stavu hlasového asistenta, audio trackom a metódam pre interakciu s asistentom.

```tsx
const { state, audioTrack } = useVoiceAssistant();
```

## 6. Stránky aplikácie

### 6.1 Hlavné stránky

- **Landing Page** (`app/page.tsx`) - Úvodná stránka s hlavnými informáciami o platforme a demonštráciou RAG-enabled asistenta
- **Dashboard** (`app/dashboard/page.tsx`) - Prehľadová stránka pre prihlásených používateľov
- **Choose Voice** (`app/choose-voice/page.tsx`) - Výber hlasu pre vytváraného asistenta
- **Load Files** (`app/load-files/page.tsx`) - Nahrávanie dokumentov do znalostnej bázy
- **Answer Questions** (`app/answer-questions/page.tsx`) - Interakcia s ALICE asistentom pre vytvorenie nového agenta
- **Test and Refine** (`app/test-and-refine-overview/page.tsx`) - Testovanie a vylepšovanie vytvoreného asistenta

### 6.2 Workflow používateľa

1. **Prihlásenie/Registrácia** - Vytvorenie účtu alebo prihlásenie
2. **Výber hlasu** - Výber hlasového profilu pre asistenta
3. **Nahranie znalostnej bázy** - Upload dokumentov pre RAG systém
4. **Odpovedanie na otázky** - Interakcia s ALICE pre definíciu asistenta
5. **Testovanie a vylepšovanie** - Testovanie vytvoreného asistenta a poskytnutie spätnej väzby
6. **Nasadenie** - Finálne nasadenie asistenta

## 7. State Management

Frontend využíva kombináciu React useState, useEffect a custom hooks pre správu stavu aplikácie:

- **useState** - Lokálny stav komponentov (napr. stav pripojenia asistenta)
- **useCallback** - Memoizované funkcie pre optimalizáciu výkonu
- **Custom hooks**:
  - `useSaveChanges` - Manažment pre ukladanie zmien
  - `useProgressIndicator` - Sledovanie postupu v procese vytvárania asistenta

## 8. Responzívny Design

Aplikácia je navrhnutá ako plne responzívna pomocou TailwindCSS. Kľúčové charakteristiky:

- Flexibilný layout s využitím Flexbox a Grid
- Responzívne rozloženie pomocou breakpointov (sm, md, lg, xl)
- Mobilný dizajn s optimalizovanými ovládacími prvkami
- Animácie optimalizované pre rôzne zariadenia

## 9. Dostupnosť (Accessibility)

Frontend implementuje základné prvky prístupnosti:
- Sémantické HTML elementy
- ARIA atribúty pre interaktívne prvky
- Alternatívne texty pre netextové prvky
- Klávesová ovládateľnosť interaktívnych prvkov

## 10. Výkon a Optimalizácie

- **Client-side rendering** s optimalizáciou pomocou Next.js
- **Lazy loading** komponentov a stránok pre zrýchlenie načítavania
- **Optimalizované animácie** pomocou Framer Motion
- **Efektívny state management** pre minimalizáciu zbytočných prerenderovaní

## 11. Zabezpečenie

- **Server-side token generácia** - Tokens pre LiveKit sú generované na strane servera
- **Environment variables** - Citlivé údaje sú uložené v env premenných
- **API rate limiting** - Implementované obmedzenie počtu požiadaviek
- **Input validácia** - Všetky používateľské vstupy sú validované

## 12. Architektúra a návrhové princípy

### 12.1 Komponentový model

Frontend je postavený na princípe znovupoužiteľných komponentov, ktoré je možné skladať do väčších celkov. Každý komponent má jasne definovanú zodpovednosť a rozhranie.

### 12.2 Separation of Concerns

Aplikácia oddeľuje:
- **UI komponenty** - Vizuálna reprezentácia
- **Logika** - Business logika v custom hooks
- **API komunikáciu** - API routes a fetch calls

### 12.3 Single Responsibility Principle

Každý komponent a modul má jednu zodpovednosť, čo zvyšuje udržateľnosť a testovateľnosť kódu.

## 13. Záver

Frontend VoiceForge AI platformy poskytuje intuitívne a moderné používateľské rozhranie pre vytváranie, testovanie a nasadzovanie hlasových asistentov. Technologický stack založený na Next.js, TypeScript, TailwindCSS a LiveKit umožňuje efektívnu implementáciu real-time hlasových interakcií s dôrazom na používateľský zážitok, výkon a škálovateľnosť.

Architektúra je navrhnutá s ohľadom na budúce rozšírenia a optimalizácie, pričom dodržiava najlepšie praktiky moderného webového vývoja.