import { access, rename, rm } from 'node:fs/promises'

export const replaceDirectoryAtomically = async (targetDirectory, replacementDirectory) => {
  const backupDirectory = `${targetDirectory}.backup-${process.pid}-${Date.now()}`
  let targetExists = true

  try {
    await access(targetDirectory)
  } catch {
    targetExists = false
  }

  if (!targetExists) {
    await rename(replacementDirectory, targetDirectory)
    return
  }

  await rename(targetDirectory, backupDirectory)
  try {
    await rename(replacementDirectory, targetDirectory)
  } catch (error) {
    await rename(backupDirectory, targetDirectory)
    throw error
  }

  await rm(backupDirectory, { recursive: true, force: true })
}
