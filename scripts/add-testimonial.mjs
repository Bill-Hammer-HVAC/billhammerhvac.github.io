import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const testimonialDirectory = process.env.TESTIMONIAL_DIR
  ? path.resolve(process.env.TESTIMONIAL_DIR)
  : path.resolve('src/content/testimonials');

const requiredValue = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

const yamlString = (value) => JSON.stringify(value);

const slugify = (value) => {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return slug || 'testimonial';
};

const replaceOrder = (source, order) => {
  if (!/^order:\s*\d+\s*$/m.test(source)) {
    throw new Error('Every existing testimonial must have a numeric order field.');
  }
  return source.replace(/^order:\s*\d+\s*$/m, `order: ${order}`);
};

async function main() {
  const names = requiredValue('TESTIMONIAL_NAMES');
  const location = requiredValue('TESTIMONIAL_LOCATION');
  const quote = requiredValue('TESTIMONIAL_QUOTE').replace(/\r\n/g, '\n');
  const role = process.env.TESTIMONIAL_ROLE?.trim() ?? '';
  const requestedOrder = Number.parseInt(requiredValue('TESTIMONIAL_ORDER'), 10);
  const featured = process.env.TESTIMONIAL_FEATURED === 'true';

  if (!Number.isSafeInteger(requestedOrder) || requestedOrder < 1) {
    throw new Error('TESTIMONIAL_ORDER must be a positive whole number.');
  }
  if (quote.includes('\u0000')) throw new Error('The testimonial contains an unsupported null character.');

  await mkdir(testimonialDirectory, { recursive: true });
  const filenames = (await readdir(testimonialDirectory)).filter((name) => name.endsWith('.md')).sort();
  const entries = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(testimonialDirectory, filename);
      const source = await readFile(filePath, 'utf8');
      const match = source.match(/^order:\s*(\d+)\s*$/m);
      if (!match) throw new Error(`${filename} is missing a numeric order field.`);
      return { filename, filePath, source, order: Number.parseInt(match[1], 10) };
    }),
  );

  const duplicateOrder = entries.find((entry, index) => entries.some((other, otherIndex) => otherIndex !== index && other.order === entry.order));
  if (duplicateOrder) throw new Error(`Existing testimonial order ${duplicateOrder.order} is duplicated. Resolve it before inserting another testimonial.`);

  for (const entry of entries) {
    if (entry.order >= requestedOrder) {
      await writeFile(entry.filePath, replaceOrder(entry.source, entry.order + 1), 'utf8');
    }
  }

  const baseSlug = slugify(names);
  let slug = baseSlug;
  let suffix = 2;
  while (filenames.includes(`${slug}.md`)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const roleLine = role ? `role: ${yamlString(role)}\n` : '';
  const content = `---\nnames: ${yamlString(names)}\nlocation: ${yamlString(location)}\n${roleLine}order: ${requestedOrder}\nfeatured: ${featured}\n---\n${quote}\n`;
  const outputPath = path.join(testimonialDirectory, `${slug}.md`);
  await writeFile(outputPath, content, 'utf8');

  process.stdout.write(`Added ${path.relative(process.cwd(), outputPath)} at order ${requestedOrder}.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
