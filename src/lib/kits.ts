import { readdir, readFile } from "fs/promises";
import path from "path";
import { zip } from "fflate";
import { products } from "./catalog";
import type { Product } from "./types";

const KITS_ROOT = path.join(process.cwd(), "content", "kits");
const SHARED_DIR = "_shared";

/** Pasta do kit = id do produto (ex: content/kits/sys-crm-pulse). */
function kitDir(productId: string): string {
  return path.join(KITS_ROOT, productId);
}

type ZipEntries = Record<string, Uint8Array>;

async function collectFiles(
  dir: string,
  prefix: string,
  into: ZipEntries,
): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      await collectFiles(absolute, relative, into);
      continue;
    }
    if (!entry.isFile()) continue;

    into[relative] = new Uint8Array(await readFile(absolute));
  }
}

export async function kitExists(productId: string): Promise<boolean> {
  try {
    const entries = await readdir(kitDir(productId));
    return entries.length > 0;
  } catch {
    return false;
  }
}

export async function listKitProductIds(): Promise<string[]> {
  const ids: string[] = [];
  for (const product of products) {
    if (await kitExists(product.id)) ids.push(product.id);
  }
  return ids;
}

export function kitFileName(product: Product, orderRef?: string): string {
  const suffix = orderRef ? `-${orderRef}` : "";
  return `isstudio-${product.slug}${suffix}.zip`;
}

function licenseText(input: {
  product: Product;
  orderRef: string;
  customerName: string;
  issuedAt: Date;
}): string {
  const { product, orderRef, customerName, issuedAt } = input;
  const scope =
    product.pricingModel === "subscription"
      ? "Licença de uso vinculada à assinatura ativa. O direito de uso cessa com o cancelamento."
      : "Licença comercial perpétua para uso em projetos próprios e de clientes.";

  return `LICENÇA DE USO — ISSTUDIO
=========================================

Produto......: ${product.name} (${product.slug})
Pedido.......: ${orderRef}
Licenciado a.: ${customerName}
Emitida em...: ${issuedAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}

ESCOPO
------
${scope}

PERMITIDO
---------
- Usar, modificar e distribuir o resultado compilado em projetos seus ou de clientes.
- Criar quantos projetos derivados quiser a partir deste código.

NÃO PERMITIDO
-------------
- Revender ou redistribuir o código-fonte deste kit como produto próprio.
- Publicar o conteúdo deste pacote em repositórios públicos.

Este arquivo é a sua prova de licença. Guarde-o junto ao pacote.
Dúvidas: contato@isstudio.com.br
`;
}

/**
 * Monta o .zip do kit em memória a partir dos arquivos versionados em
 * content/kits. Os pacotes são pequenos (alguns KB de texto), então gerar sob
 * demanda evita ter binários no Git e mantém o kit sempre igual ao repositório.
 */
export async function buildKitZip(input: {
  product: Product;
  orderRef: string;
  customerName: string;
}): Promise<Uint8Array> {
  const { product, orderRef, customerName } = input;
  const rootFolder = `isstudio-${product.slug}`;
  const files: ZipEntries = {};

  await collectFiles(kitDir(product.id), rootFolder, files);
  if (Object.keys(files).length === 0) {
    throw new Error(`Kit não encontrado para o produto ${product.id}.`);
  }

  await collectFiles(path.join(KITS_ROOT, SHARED_DIR), rootFolder, files);

  files[`${rootFolder}/LICENCA.txt`] = new TextEncoder().encode(
    licenseText({ product, orderRef, customerName, issuedAt: new Date() }),
  );

  return new Promise<Uint8Array>((resolve, reject) => {
    zip(files, { level: 9 }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
