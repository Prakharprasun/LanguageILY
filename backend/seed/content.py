"""Seeded course content: Spanish for English speakers ("Language ILY ❤️" edition).

Narrative progression:
  Unit 1: Make your intentions clear ❤️ ("I love you", greetings, and keeping the conversation alive)
  Unit 2: The dangerous one & Surviving the date (Compliments, coffee date, and talking about life)
  Unit 3: You're on your own now (Plans, weekends, travel, and asking them out)

Each skill lists vocabulary and example sentences. `seed.py` turns them into
lessons with every exercise type (multiple choice, word bank translation,
match pairs, fill in the blank and type the answer).
"""

from dataclasses import dataclass, field

COURSE = {
    "language_code": "es",
    "title": "Spanish",
    "flag_src": "/es.svg",
    "speech_locale": "es-ES",
}

LESSONS_PER_SKILL = 2


@dataclass
class Sentence:
    es: str
    en: str
    blank: tuple[str, list[str]]           # (word in `es`, distractors)
    en_alt: list[str] = field(default_factory=list)
    es_alt: list[str] = field(default_factory=list)


def V(term, translation, image=None, audio=None):
    return (term, translation, image, audio)


UNITS = [
    {
        "title": "Make your intentions clear ❤️",
        "description": "Start with 'I love you', don't immediately ruin it, and keep the chat alive",
        "color": "green",
        "skills": [
            {
                "title": "Make your intentions clear",
                "icon": "star",
                "vocab": [
                    V("te quiero", "I love you", "/logo.png"),
                    V("mi amor", "my love", "/logo.png"),
                    V("el hombre", "the man", "/man.svg", "/es_man.mp3"),
                    V("la mujer", "the woman", "/woman.svg", "/es_woman.mp3"),
                    V("el chico", "the boy", "/boy.svg", "/es_boy.mp3"),
                    V("la chica", "the girl", "/girl.svg", "/es_girl.mp3"),
                    V("mucho", "so much"),
                    V("tú", "you"),
                    V("yo", "I"),
                    V("soy", "I am"),
                ],
                "sentences": [
                    Sentence("Te quiero mucho.", "I love you so much.", ("quiero", ["soy", "eres"]),
                             en_alt=["I love you very much.", "I love you."],
                             es_alt=["Yo te quiero mucho."]),
                    Sentence("Hola, mi amor.", "Hello, my love.", ("amor", ["chico", "hombre"]),
                             en_alt=["Hi, my love."]),
                    Sentence("Soy un chico.", "I am a boy.", ("chico", ["hombre", "amor"]),
                             en_alt=["I'm a boy."], es_alt=["Yo soy un chico."]),
                    Sentence("Ella es una mujer.", "She is a woman.", ("mujer", ["chica", "amor"]),
                             en_alt=["She's a woman."], es_alt=["Es una mujer."]),
                    Sentence("El chico y la chica.", "The boy and the girl.", ("chica", ["mujer", "hombre"])),
                    Sentence("Te quiero, mi amor.", "I love you, my love.", ("quiero", ["soy", "mucho"])),
                ],
            },
            {
                "title": "Don't immediately ruin it",
                "icon": "chat",
                "vocab": [
                    V("hola", "hello"),
                    V("gracias", "thank you"),
                    V("por favor", "please"),
                    V("cómo estás", "how are you"),
                    V("buenos días", "good morning"),
                    V("buenas noches", "good night"),
                    V("muy bien", "very well"),
                    V("adiós", "goodbye"),
                    V("sí", "yes"),
                ],
                "sentences": [
                    Sentence("Hola, ¿cómo estás?", "Hello, how are you?", ("cómo", ["sí", "bien"]),
                             en_alt=["Hi, how are you?"]),
                    Sentence("Muy bien, gracias.", "Very well, thank you.", ("gracias", ["adiós", "hola"]),
                             en_alt=["Very good, thank you.", "Very well, thanks.", "Very good, thanks."]),
                    Sentence("Buenos días, mi amor.", "Good morning, my love.", ("días", ["noches", "gracias"])),
                    Sentence("Buenas noches, te quiero.", "Good night, I love you.", ("noches", ["días", "hola"])),
                    Sentence("Sí, por favor.", "Yes, please.", ("favor", ["días", "bien"])),
                    Sentence("Gracias, adiós.", "Thank you, goodbye.", ("Gracias", ["Hola", "Sí"]),
                             en_alt=["Thanks, goodbye.", "Thank you, bye.", "Thanks, bye."]),
                ],
            },
            {
                "title": "Keep the conversation alive",
                "icon": "chat",
                "vocab": [
                    V("qué haces", "what are you doing"),
                    V("de dónde eres", "where are you from"),
                    V("qué te gusta", "what do you like"),
                    V("me gusta", "I like"),
                    V("hablar", "to talk"),
                    V("contigo", "with you"),
                    V("música", "music"),
                    V("español", "Spanish"),
                ],
                "sentences": [
                    Sentence("Me gusta hablar contigo.", "I like talking to you.", ("contigo", ["música", "español"]),
                             en_alt=["I like to talk with you.", "I like talking with you."]),
                    Sentence("¿De dónde eres?", "Where are you from?", ("dónde", ["qué", "cómo"])),
                    Sentence("¿Qué haces hoy?", "What are you doing today?", ("haces", ["eres", "gusta"])),
                    Sentence("¿Qué te gusta?", "What do you like?", ("gusta", ["haces", "eres"])),
                    Sentence("Me gusta la música.", "I like music.", ("música", ["contigo", "español"]),
                             en_alt=["I like the music."]),
                ],
            },
        ],
    },
    {
        "title": "The dangerous one & Surviving the date",
        "description": "Drop smooth compliments, invite them for coffee, and talk about yourself",
        "color": "purple",
        "skills": [
            {
                "title": "The dangerous one",
                "icon": "star",
                "vocab": [
                    V("lindo", "cute"),
                    V("hermosa", "beautiful"),
                    V("increíble", "amazing"),
                    V("simpático", "sweet"),
                    V("tu sonrisa", "your smile"),
                    V("tus ojos", "your eyes"),
                    V("eres", "you are"),
                    V("muy", "really"),
                ],
                "sentences": [
                    Sentence("Eres muy lindo.", "You are really cute.", ("lindo", ["hermosa", "increíble"]),
                             en_alt=["You're really cute.", "You are very cute.", "You're very cute."]),
                    Sentence("Eres muy hermosa.", "You are so beautiful.", ("hermosa", ["lindo", "simpático"]),
                             en_alt=["You're so beautiful.", "You are very beautiful.", "You're beautiful."]),
                    Sentence("Me gusta tu sonrisa.", "I like your smile.", ("sonrisa", ["ojos", "amor"])),
                    Sentence("Eres increíble.", "You are amazing.", ("increíble", ["lindo", "muy"]),
                             en_alt=["You're amazing."]),
                    Sentence("Me gustan tus ojos.", "I like your eyes.", ("ojos", ["sonrisa", "música"])),
                ],
            },
            {
                "title": "Survive the coffee date",
                "icon": "food",
                "vocab": [
                    V("el café", "the coffee"),
                    V("el agua", "the water"),
                    V("el pan", "the bread"),
                    V("la leche", "the milk"),
                    V("el restaurante", "the restaurant"),
                    V("quieres", "would you like"),
                    V("tomar", "to get"),
                    V("conmigo", "with me"),
                    V("quiero", "I want"),
                ],
                "sentences": [
                    Sentence("¿Quieres tomar un café conmigo?", "Would you like to get coffee with me?",
                             ("café", ["agua", "pan"]),
                             en_alt=["Do you want to get coffee with me?", "Would you like to get a coffee with me?"]),
                    Sentence("Quiero un café con leche.", "I want a coffee with milk.", ("leche", ["agua", "pan"]),
                             en_alt=["I would like a coffee with milk."]),
                    Sentence("El restaurante es muy bonito.", "The restaurant is very pretty.",
                             ("restaurante", ["café", "pan"]),
                             en_alt=["The restaurant is very nice."]),
                    Sentence("Un café, por favor.", "A coffee, please.", ("café", ["agua", "leche"])),
                    Sentence("¿Quieres agua?", "Would you like water?", ("agua", ["pan", "leche"]),
                             en_alt=["Do you want water?"]),
                ],
            },
            {
                "title": "Meet the family",
                "icon": "family",
                "vocab": [
                    V("la madre", "the mother"),
                    V("el padre", "the father"),
                    V("el hermano", "the brother"),
                    V("la hermana", "the sister"),
                    V("el perro", "the dog"),
                    V("el gato", "the cat"),
                    V("mi", "my"),
                    V("tengo", "I have"),
                ],
                "sentences": [
                    Sentence("Tengo un perro muy lindo.", "I have a really cute dog.", ("perro", ["gato", "padre"]),
                             en_alt=["I have a very cute dog."]),
                    Sentence("Mi madre y mi padre.", "My mother and my father.", ("padre", ["perro", "hermano"]),
                             en_alt=["My mom and my dad."]),
                    Sentence("Mi hermana tiene un gato.", "My sister has a cat.", ("gato", ["perro", "hermano"])),
                    Sentence("Él es mi hermano.", "He is my brother.", ("hermano", ["padre", "perro"]),
                             en_alt=["He's my brother."]),
                    Sentence("Tengo una hermana.", "I have a sister.", ("Tengo", ["Soy", "Eres"])),
                ],
            },
        ],
    },
    {
        "title": "You're on your own now ♡",
        "description": "Ask about weekend plans, travel together, and ask them out",
        "color": "blue",
        "skills": [
            {
                "title": "Weekend plans",
                "icon": "clock",
                "vocab": [
                    V("este fin de semana", "this weekend"),
                    V("planes", "plans"),
                    V("tienes", "do you have"),
                    V("hoy", "today"),
                    V("mañana", "tomorrow"),
                    V("esta noche", "tonight"),
                    V("libre", "free"),
                    V("siempre", "always"),
                ],
                "sentences": [
                    Sentence("¿Tienes planes este fin de semana?", "Do you have plans this weekend?",
                             ("planes", ["hoy", "siempre"])),
                    Sentence("¿Estás libre esta noche?", "Are you free tonight?", ("noche", ["mañana", "hoy"])),
                    Sentence("Mañana estoy libre.", "Tomorrow I am free.", ("libre", ["siempre", "planes"]),
                             en_alt=["I am free tomorrow.", "I'm free tomorrow."]),
                    Sentence("Siempre pienso en ti.", "I always think about you.", ("Siempre", ["Hoy", "Mañana"]),
                             en_alt=["I always think of you."]),
                    Sentence("¿Qué haces esta noche?", "What are you doing tonight?", ("noche", ["hoy", "planes"])),
                ],
            },
            {
                "title": "Run away together",
                "icon": "plane",
                "vocab": [
                    V("la playa", "the beach"),
                    V("la ciudad", "the city"),
                    V("el avión", "the plane"),
                    V("el tren", "the train"),
                    V("el pasaporte", "the passport"),
                    V("viajar", "to travel"),
                    V("vamos", "let's go"),
                    V("juntos", "together"),
                ],
                "sentences": [
                    Sentence("Vamos a la playa juntos.", "Let's go to the beach together.",
                             ("playa", ["ciudad", "tren"]),
                             en_alt=["We are going to the beach together."]),
                    Sentence("Quiero viajar contigo.", "I want to travel with you.", ("viajar", ["hablar", "tomar"])),
                    Sentence("Necesito mi pasaporte.", "I need my passport.", ("pasaporte", ["avión", "tren"])),
                    Sentence("La ciudad es hermosa de noche.", "The city is beautiful at night.",
                             ("ciudad", ["playa", "tren"])),
                    Sentence("Vamos en tren.", "Let's go by train.", ("tren", ["avión", "playa"])),
                ],
            },
            {
                "title": "Ask them out",
                "icon": "star",
                "vocab": [
                    V("salir conmigo", "to go out with me"),
                    V("una cita", "a date"),
                    V("me gustas", "I like you"),
                    V("muchísimo", "so much"),
                    V("feliz", "happy"),
                    V("para siempre", "forever"),
                ],
                "sentences": [
                    Sentence("¿Quieres salir conmigo?", "Would you like to go out with me?",
                             ("salir", ["hablar", "viajar"]),
                             en_alt=["Do you want to go out with me?"]),
                    Sentence("Me gustas muchísimo.", "I like you so much.", ("gustas", ["quiero", "eres"]),
                             en_alt=["I really like you."]),
                    Sentence("Es una cita.", "It is a date.", ("cita", ["playa", "noche"]),
                             en_alt=["It's a date."]),
                    Sentence("Soy muy feliz contigo.", "I am very happy with you.", ("feliz", ["lindo", "libre"]),
                             en_alt=["I'm very happy with you."]),
                    Sentence("Te quiero para siempre.", "I love you forever.", ("siempre", ["mucho", "hoy"])),
                ],
            },
        ],
    },
]

# =====================================================================
# KOREAN COURSE ("Language ILY ❤️" K-Drama & Crush Edition)
# =====================================================================

KOREAN_COURSE = {
    "language_code": "kr",
    "title": "Korean",
    "flag_src": "/kr.svg",
    "speech_locale": "ko-KR",
}

KOREAN_UNITS = [
    {
        "title": "Make your intentions clear ❤️",
        "description": "Start with '사랑해 (I love you)', don't ruin it, and keep the K-drama chat alive",
        "color": "green",
        "skills": [
            {
                "title": "Make your intentions clear",
                "icon": "star",
                "vocab": [
                    V("사랑해", "I love you", "/logo.png"),
                    V("자기야", "honey", "/logo.png"),
                    V("남자", "the man", "/man.svg"),
                    V("여자", "the woman", "/woman.svg"),
                    V("소년", "the boy", "/boy.svg"),
                    V("소녀", "the girl", "/girl.svg"),
                    V("너무", "so much"),
                    V("나", "I"),
                    V("너", "you"),
                ],
                "sentences": [
                    Sentence("너 너무 사랑해.", "I love you so much.", ("사랑해", ["자기야", "너무"]),
                             en_alt=["I love you very much.", "I love you."],
                             es_alt=["사랑해.", "너무 사랑해."]),
                    Sentence("안녕, 자기야.", "Hello, honey.", ("자기야", ["남자", "소년"]),
                             en_alt=["Hi, honey.", "Hello, my love.", "Hi, my love."]),
                    Sentence("나는 남자야.", "I am a man.", ("남자야", ["여자야", "소년"]),
                             en_alt=["I'm a man."]),
                    Sentence("그녀는 여자야.", "She is a woman.", ("여자야", ["소녀", "남자"]),
                             en_alt=["She's a woman."]),
                    Sentence("소년과 소녀.", "The boy and the girl.", ("소녀", ["여자", "남자"])),
                    Sentence("사랑해, 자기야.", "I love you, honey.", ("사랑해", ["너무", "안녕"]),
                             en_alt=["I love you, my love."]),
                ],
            },
            {
                "title": "Don't immediately ruin it",
                "icon": "chat",
                "vocab": [
                    V("안녕하세요", "hello"),
                    V("고마워요", "thank you"),
                    V("제발", "please"),
                    V("잘 지내요", "how are you"),
                    V("좋은 아침", "good morning"),
                    V("잘 자요", "good night"),
                    V("네", "yes"),
                    V("좋아요", "good"),
                    V("안녕히 가세요", "goodbye"),
                ],
                "sentences": [
                    Sentence("안녕하세요, 잘 지내요?", "Hello, how are you?", ("잘", ["네", "너무"]),
                             en_alt=["Hi, how are you?"]),
                    Sentence("네, 고마워요.", "Yes, thank you.", ("고마워요", ["잘 자요", "안녕하세요"]),
                             en_alt=["Yes, thanks."]),
                    Sentence("좋은 아침, 자기야.", "Good morning, honey.", ("아침", ["자요", "네"]),
                             en_alt=["Good morning, my love."]),
                    Sentence("잘 자요, 사랑해.", "Good night, I love you.", ("자요", ["아침", "네"])),
                    Sentence("네, 좋아요.", "Yes, good.", ("좋아요", ["고마워요", "제발"]),
                             en_alt=["Yes, sounds good.", "Yes, I like it."]),
                    Sentence("고마워요, 안녕히 가세요.", "Thank you, goodbye.", ("고마워요", ["안녕하세요", "네"]),
                             en_alt=["Thanks, goodbye.", "Thank you, bye."]),
                ],
            },
            {
                "title": "Keep the conversation alive",
                "icon": "chat",
                "vocab": [
                    V("뭐 해", "what are you doing"),
                    V("어디에서 왔어요", "where are you from"),
                    V("좋아해요", "I like"),
                    V("너랑", "with you"),
                    V("이야기", "talking"),
                    V("음악", "music"),
                    V("한국어", "Korean"),
                    V("오늘", "today"),
                ],
                "sentences": [
                    Sentence("너랑 이야기 좋아해요.", "I like talking with you.", ("너랑", ["음악", "한국어"]),
                             en_alt=["I like talking to you.", "I like to talk with you."]),
                    Sentence("어디에서 왔어요?", "Where are you from?", ("어디에서", ["오늘", "음악"])),
                    Sentence("오늘 뭐 해?", "What are you doing today?", ("오늘", ["음악", "한국어"])),
                    Sentence("나는 음악 좋아해요.", "I like music.", ("음악", ["한국어", "오늘"]),
                             en_alt=["I like the music."]),
                    Sentence("한국어 좋아해요.", "I like Korean.", ("한국어", ["음악", "이야기"])),
                ],
            },
        ],
    },
    {
        "title": "The dangerous one & Surviving the date",
        "description": "Drop K-drama compliments, invite them to a Seoul café, and talk about life",
        "color": "purple",
        "skills": [
            {
                "title": "The dangerous one",
                "icon": "star",
                "vocab": [
                    V("귀여워", "cute"),
                    V("예뻐요", "pretty"),
                    V("멋져요", "cool"),
                    V("미소", "smile"),
                    V("눈", "eyes"),
                    V("진짜", "really"),
                    V("마음에 들어", "I like it"),
                ],
                "sentences": [
                    Sentence("너 진짜 귀여워.", "You are really cute.", ("귀여워", ["예뻐요", "멋져요"]),
                             en_alt=["You're really cute.", "You are very cute."]),
                    Sentence("너 진짜 예뻐요.", "You are really pretty.", ("예뻐요", ["귀여워", "멋져요"]),
                             en_alt=["You're really pretty.", "You are so beautiful.", "You're beautiful."]),
                    Sentence("너 미소 좋아해요.", "I like your smile.", ("미소", ["눈", "음악"])),
                    Sentence("진짜 멋져요.", "You are really cool.", ("멋져요", ["귀여워", "미소"]),
                             en_alt=["You're really cool.", "You are amazing."]),
                    Sentence("너 눈 예뻐요.", "Your eyes are pretty.", ("눈", ["미소", "오늘"]),
                             en_alt=["You have pretty eyes."]),
                ],
            },
            {
                "title": "Survive the Seoul café date",
                "icon": "food",
                "vocab": [
                    V("커피", "coffee"),
                    V("물", "water"),
                    V("빵", "bread"),
                    V("우유", "milk"),
                    V("카페", "café"),
                    V("마실래요", "shall we drink"),
                    V("우리", "we"),
                    V("주세요", "please give me"),
                ],
                "sentences": [
                    Sentence("우리 커피 마실래요?", "Shall we drink coffee?", ("커피", ["물", "빵"]),
                             en_alt=["Would you like to get coffee?", "Would you like to get coffee with me?",
                                     "Shall we grab coffee?"]),
                    Sentence("커피 주세요.", "Coffee, please.", ("커피", ["물", "우유"]),
                             en_alt=["Please give me coffee."]),
                    Sentence("이 카페 진짜 예뻐요.", "This café is really pretty.", ("카페", ["커피", "우유"]),
                             en_alt=["This cafe is really pretty.", "This cafe is very nice."]),
                    Sentence("물 주세요.", "Water, please.", ("물", ["커피", "빵"])),
                    Sentence("우유 좋아해요.", "I like milk.", ("우유", ["물", "빵"])),
                ],
            },
            {
                "title": "Meet the family",
                "icon": "family",
                "vocab": [
                    V("엄마", "mom"),
                    V("아빠", "dad"),
                    V("오빠", "older brother"),
                    V("언니", "older sister"),
                    V("강아지", "puppy"),
                    V("고양이", "cat"),
                    V("우리", "my"),
                    V("있어요", "I have"),
                ],
                "sentences": [
                    Sentence("귀여운 강아지 있어요.", "I have a cute puppy.", ("강아지", ["고양이", "아빠"]),
                             en_alt=["I have a cute dog."]),
                    Sentence("우리 엄마와 아빠.", "My mom and dad.", ("아빠", ["강아지", "오빠"]),
                             en_alt=["My mother and father."]),
                    Sentence("고양이 있어요.", "I have a cat.", ("고양이", ["강아지", "엄마"])),
                    Sentence("우리 언니 진짜 멋져요.", "My older sister is really cool.", ("언니", ["오빠", "엄마"]),
                             en_alt=["My sister is really cool."]),
                    Sentence("우리 오빠 좋아해요.", "I like my older brother.", ("오빠", ["언니", "아빠"]),
                             en_alt=["I like my brother."]),
                ],
            },
        ],
    },
    {
        "title": "You're on your own now ♡",
        "description": "Ask about weekend plans, take the KTX train together, and confess",
        "color": "blue",
        "skills": [
            {
                "title": "Weekend plans",
                "icon": "clock",
                "vocab": [
                    V("이번 주말", "this weekend"),
                    V("시간", "time"),
                    V("있어요", "do you have"),
                    V("오늘 밤", "tonight"),
                    V("내일", "tomorrow"),
                    V("항상", "always"),
                    V("생각해", "I think of"),
                ],
                "sentences": [
                    Sentence("이번 주말 시간 있어요?", "Do you have time this weekend?", ("주말", ["오늘", "내일"]),
                             en_alt=["Do you have plans this weekend?", "Are you free this weekend?"]),
                    Sentence("오늘 밤 뭐 해?", "What are you doing tonight?", ("밤", ["주말", "내일"])),
                    Sentence("내일 시간 있어요.", "I have time tomorrow.", ("내일", ["오늘", "항상"]),
                             en_alt=["I am free tomorrow."]),
                    Sentence("항상 너 생각해.", "I always think of you.", ("항상", ["내일", "오늘"]),
                             en_alt=["I always think about you."]),
                    Sentence("내일 만나요.", "Let's meet tomorrow.", ("내일", ["주말", "항상"]),
                             en_alt=["See you tomorrow."]),
                ],
            },
            {
                "title": "Run away together",
                "icon": "plane",
                "vocab": [
                    V("바다", "the beach"),
                    V("서울", "Seoul"),
                    V("비행기", "airplane"),
                    V("기차", "train"),
                    V("여행", "travel"),
                    V("같이", "together"),
                    V("가자", "let's go"),
                ],
                "sentences": [
                    Sentence("우리 같이 바다 가자.", "Let's go to the beach together.", ("바다", ["서울", "기차"])),
                    Sentence("너랑 여행 좋아해요.", "I like traveling with you.", ("여행", ["바다", "비행기"]),
                             en_alt=["I want to travel with you."]),
                    Sentence("서울 진짜 멋져요.", "Seoul is really cool.", ("서울", ["바다", "기차"]),
                             en_alt=["Seoul is amazing."]),
                    Sentence("기차 같이 가자.", "Let's go by train together.", ("기차", ["비행기", "서울"]),
                             en_alt=["Let's take the train together."]),
                    Sentence("우리 서울 가자.", "Let's go to Seoul.", ("서울", ["바다", "여행"])),
                ],
            },
            {
                "title": "Ask them out",
                "icon": "star",
                "vocab": [
                    V("나랑 사귈래", "will you go out with me"),
                    V("데이트", "a date"),
                    V("진짜 좋아해", "I really like you"),
                    V("행복해", "happy"),
                    V("영원히", "forever"),
                ],
                "sentences": [
                    Sentence("나랑 사귈래?", "Will you go out with me?", ("사귈래", ["행복해", "영원히"]),
                             en_alt=["Would you like to go out with me?", "Do you want to go out with me?"]),
                    Sentence("너 진짜 좋아해.", "I really like you.", ("좋아해", ["행복해", "데이트"]),
                             en_alt=["I like you so much."]),
                    Sentence("오늘 데이트 가자.", "Let's go on a date today.", ("데이트", ["바다", "서울"])),
                    Sentence("너랑 진짜 행복해.", "I am really happy with you.", ("행복해", ["좋아해", "사귈래"]),
                             en_alt=["I'm really happy with you.", "I am very happy with you."]),
                    Sentence("영원히 사랑해.", "I love you forever.", ("영원히", ["항상", "오늘"])),
                ],
            },
        ],
    },
]

ACHIEVEMENTS = [
    # family, title, metric, color, [(threshold, description), ...]
    ("wildfire", "Heartthrob Streak", "streak", "#C81E3A",
     [(3, "Keep a 3-day crush streak"), (7, "Keep a 7-day crush streak"),
      (14, "Keep a 14-day crush streak"), (30, "Keep a 30-day crush streak")]),
    ("sage", "Smooth Talker", "total_xp", "#E11D48",
     [(100, "Earn 100 Rizz XP"), (250, "Earn 250 Rizz XP"),
      (500, "Earn 500 Rizz XP"), (1000, "Earn 1000 Rizz XP")]),
    ("scholar", "Love Lexicon", "words", "#EC4899",
     [(10, "Learn 10 romantic & everyday words"), (30, "Learn 30 words"), (60, "Learn 60 words")]),
    ("sharpshooter", "Zero Awkwardness", "perfect_lessons", "#DB2777",
     [(1, "Finish a lesson with 0 mistakes"), (5, "Finish 5 flawless lessons"),
      (10, "Finish 10 flawless lessons")]),
    ("conqueror", "First Date Ready", "skills", "#BE123C",
     [(1, "Master your 1st skill"), (3, "MasterUnit 1 skills"), (9, "Master every skill in the course")]),
    ("champion", "Hopeless Romantic", "lessons", "#F43F5E",
     [(5, "Complete 5 lessons"), (10, "Complete 10 lessons"), (18, "Complete 18 lessons")]),
]

QUESTS = [
    ("earn_xp", "Earn 30 Rizz XP today", "xp_today", 30, 10),
    ("complete_lessons", "Complete 2 lessons for your crush", "lessons_today", 2, 10),
    ("perfect_lesson", "Flawless lesson (don't embarrass yourself)", "perfect_today", 1, 15),
]

LEARNER = {"username": "romeo", "display_name": "Romeo Learner", "avatar_color": "#C81E3A"}

RIVALS = [
    ("sofia_g", "Sofía", "#E11D48"), ("mateo99", "Mateo", "#EC4899"), ("emma.w", "Emma", "#C81E3A"),
    ("liam_k", "Liam", "#DB2777"), ("valen", "Valentina", "#BE123C"), ("noah.b", "Noah", "#F43F5E"),
    ("aarav", "Aarav", "#9F1239"), ("yuki_t", "Yuki", "#F472B6"), ("chloe", "Chloé", "#E11D48"),
    ("lucas.m", "Lucas", "#BE185D"), ("priya_s", "Priya", "#C81E3A"), ("diego", "Diego", "#FB7185"),
    ("hannah", "Hannah", "#DB2777"), ("omar.a", "Omar", "#881337"),
]
