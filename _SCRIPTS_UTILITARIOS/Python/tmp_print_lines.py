import pathlib
path = pathlib.Path( wgeasy/frontend/LINK-TESTE-PUBLICO.txt)
lines = path.read_text(encoding=utf-8, errors=replace).splitlines()
for idx, line in enumerate(lines, 1):
    safe = line.encode(ascii, ignore).decode(ascii)
    print(f'{idx:02d}\t{safe}')
