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
  const socialImage = await page.request.get(new URL('/social-preview.png', base).toString());
  assert.equal(socialImage.status(), 200);
  assert.equal(socialImage.headers()['content-type'], 'image/png');
  const socialImageBytes = await socialImage.body();
  assert.equal(socialImageBytes.readUInt32BE(16), 1733);
  assert.equal(socialImageBytes.readUInt32BE(20), 907);
  const dogsUrl = new URL('/dogs', base).toString();
  const dogsResponse = await page.goto(dogsUrl);
  assert.equal(dogsResponse?.status(), 200, `Direct request to ${dogsUrl} did not return HTTP 200`);
  assert.equal(
    await page.locator('meta[property="og:image"]').getAttribute('content'),
    'https://pawtinerary.vercel.app/social-preview.png',
  );
  assert.equal(
    await page.locator('meta[name="twitter:card"]').getAttribute('content'),
    'summary_large_image',
  );
  assert.equal(
    await page.locator('meta[name="description"]').getAttribute('content'),
    'Plan dog walks, keep client details organized, and track visits in one calm workspace.',
  );
  await page.getByText('No dogs yet. Create your first dog to get started.').first().waitFor();
  const reloadResponse = await page.reload();
  assert.equal(reloadResponse?.status(), 200, `Refreshing ${dogsUrl} did not return HTTP 200`);
  assert.equal(new URL(page.url()).pathname, '/dogs');
  await page.getByText('No dogs yet. Create your first dog to get started.').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(17, 27, 24)');
  await page.getByRole('button', { name: 'Theme' }).click();
  await page.getByRole('button', { name: /Light Mode/ }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(247, 246, 241)');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.getByRole('button', { name: 'Theme' }).click();
  await page.getByRole('button', { name: /Dog Mode/ }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dog');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(255, 243, 216)');
  assert(await page.evaluate(() => getComputedStyle(document.body).backgroundImage.includes('dog-pattern.svg')));
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dog');
  await page.getByRole('button', { name: 'Theme' }).click();
  await page.getByRole('button', { name: /Dark Mode/ }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');

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
  await page.getByText('Enter a numeric hourly rate, such as 20 or 20.50.').waitFor({ state: 'hidden' });
  await page.getByText('Enter a valid email address, such as pat@example.com.').waitFor({ state: 'hidden' });
  await page.getByLabel('Entry / access instructions').fill('PRIVATE-CODE-123');
  await page.getByRole('button', { name: 'Add date' }).click();
  await page.getByRole('button', { name: 'Add date' }).click();
  assert.equal(await page.getByLabel('Duration').count(), 0);
  await page.getByRole('button', { name: 'Create dog', exact: true }).last().click();
  await page.getByText('Group 1 is already planned for this date.').waitFor();
  await page.getByLabel('Group').nth(1).selectOption('Group 3');
  await page.getByText('Group 1 is already planned for this date.').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Create dog', exact: true }).last().click();
  await page.getByText('Scheduled services').waitFor();
  assert.equal(await page.getByText('€50.00').count(), 0);

  await page.getByRole('button', { name: 'More' }).first().click();
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  const editService = page.getByRole('dialog', { name: 'Edit service' });
  await editService.waitFor();
  assert.equal(await editService.getByLabel('Duration').count(), 0);
  await editService.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Add Service' }).first().click();
  assert.equal(await page.getByRole('dialog', { name: 'Add service' }).getByLabel('Duration').count(), 0);
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
  assert.deepEqual(await page.getByRole('list', { name: 'Group 1: Dogs to visit' }).locator('li').allTextContents(), ['Bailey']);
  assert.deepEqual(await page.getByRole('list', { name: 'Group 3: Dogs to visit' }).locator('li').allTextContents(), ['Bailey']);
  assert.equal(await page.getByText('Bailey').count() >= 2, true);
  if (screenshots) { await page.waitForTimeout(3600); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: '/private/tmp/pawtinerary-mobile.png', fullPage: true }); }
  await page.getByRole('button', { name: 'Complete' }).first().click();
  assert.equal(await page.getByRole('list', { name: 'Group 1: Dogs to visit' }).count(), 0);
  assert.deepEqual(await page.getByRole('list', { name: 'Group 3: Dogs to visit' }).locator('li').allTextContents(), ['Bailey']);
  await page.getByRole('link', { name: 'Bailey' }).first().click();
  await page.getByText('Completed history').waitFor();
  assert.equal(await page.getByText('€20.00').count() > 0, true);

  await page.getByRole('link', { name: 'Edit Info' }).click();
  await page.getByLabel('Hourly rate (€) *').fill('25');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByText('€25.00').first().waitFor();
  assert.equal(await page.getByText('€20.00').count(), 0);
  await page.getByRole('button', { name: /1 Main Street, Dublin/ }).click();
  await page.getByText('Address copied!').waitFor();

  await page.getByRole('button', { name: 'Send Data' }).click();
  await page.getByLabel('Report period').selectOption('day');
  await page.getByRole('button', { name: 'Copy Report Text' }).click();
  const reportText = await page.evaluate(() => navigator.clipboard.readText());
  assert(reportText.includes('Bailey'));
  assert(reportText.includes('completed'));
  assert(!reportText.includes('€'));
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
  assert(!documentXml.includes('€'));
  assert(!documentXml.includes('PRIVATE-CODE-123'));
  await page.getByRole('button', { name: 'Close' }).click();

  await page.reload();
  await page.getByText('€25.00').first().waitFor();
  assert.equal(await page.getByRole('link', { name: 'Earnings' }).count(), 0);
  await page.getByRole('button', { name: 'Open calculator' }).click();
  for (const key of ['2', '0', '+', '5', '=']) await page.getByRole('button', { name: key, exact: true }).click();
  await page.getByText('25', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'Schedule' }).last().click();
  await page.getByRole('tab', { name: 'Week' }).click();
  await page.getByText('Bailey').first().waitFor();
  await page.getByRole('tab', { name: 'Month' }).click();
  assert.equal(await page.getByRole('tab', { name: 'Month' }).getAttribute('aria-selected'), 'true');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  await page.getByRole('link', { name: 'Dogs' }).last().click();
  await page.getByText('Bailey').first().click();
  await page.getByRole('button', { name: 'Delete Dog' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByText('Scheduled services').waitFor();
  await page.getByRole('button', { name: 'Delete Dog' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Are you sure? Deleting this dog will remove all associated services.').waitFor();
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
  await page.getByRole('button', { name: 'Tema' }).click();
  await page.getByRole('button', { name: /Modo perro/ }).waitFor();
  await page.getByRole('button', { name: 'Cerrar' }).click();
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

  const legacyContext = await browser.newContext();
  try {
    const legacyPage = await legacyContext.newPage();
    await legacyPage.goto(base);
    await legacyPage.getByText('No dogs yet. Create your first dog to get started.').first().waitFor();
    await legacyPage.evaluate(() => {
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      localStorage.removeItem('pawtinerary.data.v2');
      localStorage.setItem('pawtinerary.data.v1', JSON.stringify({
        version: 1,
        dogs: [
          { id: 'legacy-dog', name: 'Legacy Dog', address: '1 Main Street', hourlyRate: 20 },
          { id: 'second-dog', name: 'Second Dog', address: '2 Main Street', hourlyRate: 22 },
        ],
        services: [
          { id: 'long', dogId: 'legacy-dog', date: key, group: 'Group 1', durationMinutes: 90, status: 'scheduled' },
          { id: 'second', dogId: 'second-dog', date: key, group: 'Group 1', durationMinutes: 60, status: 'scheduled' },
          { id: 'short', dogId: 'legacy-dog', date: key, group: 'Group 2', durationMinutes: 30, status: 'completed', completedHourlyRate: 18 },
        ],
      }));
    });
    await legacyPage.goto(new URL('/dogs/legacy-dog', base).toString());
    await legacyPage.getByText('Scheduled services').waitFor();
    assert(await legacyPage.getByText('€20.00').count() > 0);
    assert.equal(await legacyPage.getByText('€18.00').count(), 0);
    await legacyPage.waitForFunction(() => localStorage.getItem('pawtinerary.data.v2') !== null);
    const migrated = await legacyPage.evaluate(() => JSON.parse(localStorage.getItem('pawtinerary.data.v2')));
    assert.equal(migrated.version, 2);
    assert.equal(migrated.dogs.length, 2);
    assert.equal(migrated.services.length, 3);
    assert(migrated.services.every(service => !('durationMinutes' in service)));
    assert(migrated.services.every(service => !('completedHourlyRate' in service)));
    await legacyPage.reload();
    await legacyPage.getByText('Completed history').waitFor();
    await legacyPage.goto(base);
    const groupList = legacyPage.getByRole('list', { name: 'Group 1: Dogs to visit' });
    await groupList.waitFor();
    assert.deepEqual(await groupList.locator('li').allTextContents(), ['Legacy Dog', 'Second Dog']);
    assert.equal(await legacyPage.getByRole('list', { name: 'Group 2: Dogs to visit' }).count(), 0);
  } finally {
    await legacyContext.close();
  }
  console.log('Pawtinerary mobile and desktop smoke workflows passed.');
} finally {
  await browser.close();
}
