const stemPattern = /(?<=\/)([^\/\.]+)(?=\.)]/;

export const getStem = (filename: string) => {
  return filename.match(stemPattern)?.[0] ?? null;
};
