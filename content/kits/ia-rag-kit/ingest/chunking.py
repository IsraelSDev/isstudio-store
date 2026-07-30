"""Split de texto com overlap.

Usamos tokens aproximados (palavras * 1.3) para não depender do tiktoken no
caminho quente; o ingest CLI pode refinar com o encoder do modelo.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    index: int
    text: str
    source: str


def approx_tokens(text: str) -> int:
    return max(1, int(len(text.split()) * 1.3))


def chunk_text(
    text: str,
    *,
    source: str,
    chunk_size: int = 800,
    overlap: int = 200,
) -> list[Chunk]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")

    words = text.split()
    if not words:
        return []

    # Converte tokens-alvo em janela de palavras.
    window = max(1, int(chunk_size / 1.3))
    step = max(1, int((chunk_size - overlap) / 1.3))

    chunks: list[Chunk] = []
    start = 0
    index = 0
    while start < len(words):
        end = min(len(words), start + window)
        piece = " ".join(words[start:end]).strip()
        if piece:
            chunks.append(Chunk(index=index, text=piece, source=source))
            index += 1
        if end >= len(words):
            break
        start += step

    return chunks
