import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.PAWTINERARY_URL ?? 'http://127.0.0.1:5173';
const screenshots = process.argv.includes('--screenshots');

try {
  await page.goto(base);
  await page.getByText('No dogs yet. Create your first dog to get started.').first().waitFor();
  await page.getByRole('button', { name: 'Create Dog' }).first().click();
  await page.getByRole('button', { name: 'Create dog', exact: true }).last().click();
  await page.getByText("Enter the dog's name.").waitFor();
  await page.getByText('Enter an hourly rate in euros.').waitFor();
  await page.getByText("Enter the dog's address.").waitFor();
  assert(await page.getByLabel('Dog name *').evaluate(element => document.activeElement === element));
  await page.getByLabel('Dog name *').fill('Bailey');
  await page.getByLabel('Hourly rate (€) *').fill('twenty');
  await page.getByLabel('Address *').fill('1 Main Street, Dublin');
  await page.getByLabel('Owner / client name').fill('Pat');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Create dog', exact: true }).last().click();
  await page.getByText('Enter a numeric hourly rate, such as 20 or 20.50.').waitFor();
  await page.getByText('Enter a valid email address, such as pat@example.com.').waitFor();
  await page.getByLabel('Hourly rate (€) *').fill('20');
  await page.getByLabel('Email').fill('pat@example.com');
  await page.getByLabel('Entry / access instructions').fill('PRIVATE-CODE-123');
  await page.getByRole('button', { name: 'Add date' }).click();
  await page.getByRole('button', { name: 'Add date' }).click();
  await page.getByRole('button', { name: 'Create dog', exact: true }).last().click();
  await page.getByText('Group 1 is already planned for this date.').waitFor();
  await page.getByLabel('Group').nth(1).selectOption('Group 3');
  await page.getByLabel('Duration').nth(1).selectOption('90');
  await page.getByRole('button', { name: 'Create dog', exact: true }).last().click();
  await page.getByText('Earnings for Bailey').waitFor();
  assert.equal(await page.getByText('€50.00').count() > 0, true);

  await page.getByRole('button', { name: 'Add Service' }).first().click();
  await page.getByLabel('Date').last().fill('2026-12-31');
  await page.getByLabel('Group').last().selectOption('Group 2');
  await page.getByRole('button', { name: 'Add service', exact: true }).last().click();
  await page.getByRole('button', { name: 'Add Service' }).first().click();
  await page.getByLabel('Date').last().fill('2026-12-31');
  await page.getByLabel('Group').last().selectOption('Group 2');
  await page.getByRole('button', { name: 'Add service', exact: true }).last().click();
  await page.getByText('Bailey already has a Group 2 service on this date. Choose another group or date.').waitFor();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('link', { name: 'Schedule' }).last().click();
  await page.getByText('Group 1').first().waitFor();
  assert.equal(await page.getByText('Bailey').count() >= 2, true);
  if (screenshots) { await page.waitForTimeout(3600); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: '/private/tmp/pawtinerary-mobile.png', fullPage: true }); }
  await page.getByRole('button', { name: 'Complete' }).first().click();
  await page.getByRole('link', { name: 'Bailey' }).first().click();
  await page.getByText('Earnings for Bailey').waitFor();
  assert.equal(await page.getByText('€30.00').count() > 0, true);

  await page.getByRole('link', { name: 'Edit Info' }).click();
  await page.getByLabel('Hourly rate (€) *').fill('25');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByText('€37.50').first().waitFor();
  assert.equal(await page.getByText('€20.00').count() > 0, true);
  await page.getByRole('button', { name: /1 Main Street, Dublin/ }).click();
  await page.getByText('Address copied!').waitFor();

  await page.getByRole('button', { name: 'Send Data' }).click();
  await page.getByLabel('Report period').selectOption('day');
  await page.getByRole('button', { name: 'Copy Report Text' }).click();
  const reportText = await page.evaluate(() => navigator.clipboard.readText());
  assert(reportText.includes('Earned: €20.00'));
  assert(reportText.includes('Potential: €37.50'));
  assert(!reportText.includes('PRIVATE-CODE-123'));
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download DOCX' }).click();
  const download = await downloadPromise;
  assert(download.suggestedFilename().endsWith('.docx'));
  const bytes = await readFile(await download.path());
  assert(bytes.length > 1000);
  assert.equal(bytes.subarray(0, 2).toString(), 'PK');
  const documentXml = execFileSync('unzip', ['-p', await download.path(), 'word/document.xml'], { encoding: 'utf8' });
  assert(documentXml.includes('Bailey'));
  assert(!documentXml.includes('PRIVATE-CODE-123'));
  await page.getByRole('button', { name: 'Close' }).click();

  await page.reload();
  await page.getByRole('link', { name: 'Earnings' }).last().click();
  await page.getByText('€37.50').first().waitFor();
  await page.getByRole('button', { name: 'Open calculator' }).click();
  for (const key of ['2', '0', '+', '5', '=']) await page.getByRole('button', { name: key, exact: true }).click();
  await page.getByText('25', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'Schedule' }).last().click();
  await page.getByRole('tab', { name: 'Week' }).click();
  await page.getByText('THIS WEEK · EARNED').waitFor();
  await page.getByRole('tab', { name: 'Month' }).click();
  await page.getByText('THIS MONTH · EARNED').waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  await page.getByRole('link', { name: 'Dogs' }).last().click();
  await page.getByText('Bailey').first().click();
  await page.getByRole('button', { name: 'Delete Dog' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByText('Earnings for Bailey').waitFor();
  await page.getByRole('button', { name: 'Delete Dog' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Are you sure? Deleting this dog will remove all earnings from your data.').waitFor();
  await page.getByRole('button', { name: 'Delete Dog' }).last().click();
  await page.getByText('No dogs yet. Create your first dog to get started.').waitFor();
  await page.reload();
  await page.getByText('No dogs yet. Create your first dog to get started.').waitFor();

  await page.setViewportSize({ width: 1280, height: 850 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  assert.equal(await page.getByRole('navigation', { name: 'Primary navigation' }).isVisible(), true);
  if (screenshots) await page.screenshot({ path: '/private/tmp/pawtinerary-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Language' }).click();
  await page.getByRole('button', { name: 'Spanish' }).click();
  await page.getByRole('link', { name: 'Agenda' }).first().click();
  await page.getByText('Los buenos paseos empiezan con un buen plan.').waitFor();
  await page.getByRole('button', { name: 'Crear perro' }).first().click();
  await page.getByRole('button', { name: 'Crear perro' }).last().click();
  await page.getByText('Introduce el nombre del perro.').waitFor();
  await page.getByRole('button', { name: 'Idioma' }).click();
  await page.getByRole('button', { name: 'Catalán' }).click();
  await page.getByText('Introdueix el nom del gos.').waitFor();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'ca');
  await page.getByLabel('Nom del gos *').waitFor();
  await page.getByRole('link', { name: 'Agenda' }).first().click();
  await page.getByRole('button', { name: 'Enviar dades' }).click();
  await page.getByRole('button', { name: "Copiar el text de l'informe" }).click();
  const catalanReport = await page.evaluate(() => navigator.clipboard.readText());
  assert(catalanReport.includes('SERVEIS'));
  assert(catalanReport.includes('Informe:'));
  const catalanDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar DOCX' }).click();
  const catalanDownload = await catalanDownloadPromise;
  assert(catalanDownload.suggestedFilename().startsWith('Pawtinerary-Mes-'));
  const catalanXml = execFileSync('unzip', ['-p', await catalanDownload.path(), 'word/document.xml'], { encoding: 'utf8' });
  assert(catalanXml.includes('Informe de serveis'));
  assert(catalanXml.includes('No hi ha serveis en aquest període.'));
  await page.getByRole('button', { name: 'Tancar' }).click();
  await page.setViewportSize({ width: 320, height: 700 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  if (screenshots) { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: '/private/tmp/pawtinerary-catalan-320.png', fullPage: true }); }
  for (const width of [390, 768, 1119, 1120, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal overflow at ${width}px`);
  }
  await page.getByRole('button', { name: 'Llengua' }).click();
  await page.getByRole('button', { name: 'Anglès (predeterminat)' }).click();
  await page.getByRole('link', { name: 'Schedule' }).last().waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.deepEqual(errors, []);
  console.log('Pawtinerary mobile and desktop smoke workflows passed.');
} finally {
  await browser.close();
}
