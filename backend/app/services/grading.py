"""Answer grading.

Free text answers are compared after normalisation (case, punctuation and
whitespace are ignored). Like Duolingo, a missing accent is still accepted,
with a gentle note telling the learner to watch out for accents.
"""

import re
import unicodedata
from dataclasses import dataclass

_PUNCTUATION = re.compile(r"[¿?¡!.,;:\"“”'’«»()\-]")
_SPACES = re.compile(r"\s+")


@dataclass
class GradeResult:
    correct: bool
    note: str | None = None


def normalize(text: str) -> str:
    text = _PUNCTUATION.sub(" ", text.lower())
    return _SPACES.sub(" ", text).strip()


def strip_accents(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def grade_text(answer: str, accepted: list[str]) -> GradeResult:
    given = normalize(answer)
    if not given:
        return GradeResult(False)
    candidates = [normalize(a) for a in accepted]
    if given in candidates:
        return GradeResult(True)
    if strip_accents(given) in {strip_accents(c) for c in candidates}:
        return GradeResult(True, "Pay attention to the accents.")
    return GradeResult(False)

