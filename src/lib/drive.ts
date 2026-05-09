export async function uploadToGoogleDrive(file: File, accessToken: string): Promise<{ id: string; webViewLink: string }> {
  // Step 1: Upload the raw file (this creates a file with "Untitled" name)
  const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': file.size.toString(),
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`Google Drive API upload error: ${uploadResponse.status} ${errText}`);
  }

  const result = await uploadResponse.json();
  const fileId = result.id;

  // Step 2: Update the file metadata (name) and get the webViewLink
  const metadata = {
    name: file.name,
  };

  const metadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,webViewLink`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!metadataResponse.ok) {
    const errText = await metadataResponse.text();
    throw new Error(`Google Drive API metadata error: ${metadataResponse.status} ${errText}`);
  }

  return await metadataResponse.json();
}

export async function deleteFromGoogleDrive(fileId: string, accessToken: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive API delete error: ${response.status} ${errText}`);
  }
}
