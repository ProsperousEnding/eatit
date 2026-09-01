import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { replaceDirectoryAtomically } from './atomic-directory.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory =>
    rm(directory, { recursive: true, force: true })
  ))
})

describe('replaceDirectoryAtomically', () => {
  it('replaces the complete directory and removes old files', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'eatit-directory-test-'))
    temporaryDirectories.push(root)
    const target = path.join(root, 'target')
    const replacement = path.join(root, 'replacement')
    await mkdir(target)
    await mkdir(replacement)
    await writeFile(path.join(target, 'old.txt'), 'old')
    await writeFile(path.join(replacement, 'new.txt'), 'new')

    await replaceDirectoryAtomically(target, replacement)

    await expect(readFile(path.join(target, 'new.txt'), 'utf8')).resolves.toBe('new')
    await expect(readFile(path.join(target, 'old.txt'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
