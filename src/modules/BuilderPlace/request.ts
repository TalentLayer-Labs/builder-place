export const upload = async (file: File, fileName?: string): Promise<any> => {
  console.log(file);
  try {
    let formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`/api/domain/upload${fileName ? `?fileName=${fileName}` : ''}`, {
      method: 'POST',
      body: formData,
    });
    return (await response.json()).image;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getBuilderPlaceFromOwner = async (talentLayerId: string): Promise<any> => {
  try {
    return await fetch('/api/domain/get-builder-place-from-owner', {
      method: 'POST',
      body: JSON.stringify({
        id: talentLayerId,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getBuilderPlaceById = async (id: string): Promise<any> => {
  try {
    return await fetch('/api/domain/get-builder-place-by-id', {
      method: 'POST',
      body: JSON.stringify({
        id: id,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
