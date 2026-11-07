"""Generador autónomo Python 3.9+ sin dependencias. --check valida sin escribir."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import argparse, base64, html, mimetypes, re, sys

MEDIA = {'.jpg','.jpeg','.png','.gif','.webp','.svg','.avif','.ico','.mp3','.wav','.ogg','.m4a','.aac','.flac','.mp4','.webm','.woff','.woff2','.ttf','.otf'}
MIME = {'.webp':'image/webp','.mp3':'audio/mpeg','.m4a':'audio/mp4','.svg':'image/svg+xml'}
class Attributes(HTMLParser):
    def __init__(self, tag):
        super().__init__(convert_charrefs=True)
        self.values = {}
        self.feed(tag)
    def handle_starttag(self, tag, attrs):
        self.values = dict(attrs)

class Builder:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.resources, self.cache = set(), {}
    def local(self, ref, base):
        ref = html.unescape(ref.strip())
        url = urlsplit(ref)
        if url.scheme or url.netloc or ref.startswith(('/', '\\')) or not url.path:
            raise ValueError('Recurso no local: ' + ref[:160])
        path = (Path(base) / unquote(url.path).replace('\\','/')).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError('Ruta fuera del proyecto: ' + ref)
        if not path.is_file():
            raise FileNotFoundError('Falta el recurso: ' + str(path.relative_to(self.root)))
        self.resources.add(path)
        return path
    def data(self, ref, base):
        if ref.startswith(('data:', '#')):
            return ref
        path = self.local(ref, base)
        if path.suffix.lower() not in MEDIA:
            raise ValueError('Tipo no admitido: ' + path.name)
        if path not in self.cache:
            mime = MIME.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0]
            if not mime:
                raise ValueError('MIME desconocido: ' + path.name)
            self.cache[path] = 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode('ascii')
        fragment = urlsplit(ref).fragment
        return self.cache[path] + ('#' + fragment if fragment else '')
    def css(self, text, base, ancestors=()):
        def imported(m):
            path = self.local(m.group('url') or m.group('plain'), base)
            if path in ancestors:
                raise ValueError('Importación CSS circular: ' + path.name)
            value = self.css(path.read_text(encoding='utf-8-sig'), path.parent, ancestors+(path,))
            media = m.group('media').strip()
            if media.startswith(('layer','supports')):
                raise ValueError('Usa links separados para imports layer/supports.')
            return '@media '+media+' {\n'+value+'\n}' if media else value
        text = re.sub(r'''@import\s+(?:url\(\s*["']?(?P<url>[^\s)"']+)["']?\s*\)|["'](?P<plain>[^"']+)["'])\s*(?P<media>[^;]*);''', imported, text, flags=re.I)
        return re.sub(r'''url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)''',
            lambda m:'url("'+self.data(next(x for x in m.groups() if x is not None).strip(),base)+'")',text,flags=re.I)
    def javascript(self,text,base):
        def literal(m):
            value=m.group(2)
            if value.startswith('data:') or chr(36)+'{' in value:
                return m.group(0)
            try:
                suffix=Path(urlsplit(value).path).suffix.lower()
            except ValueError:
                return m.group(0)
            if suffix in MEDIA and not re.search(r'[\r\n]',value):
                return m.group(1)+self.data(value,base)+m.group(1)
            return m.group(0)
        if re.search(r'\b(?:fetch|importScripts)\s*\(|\bXMLHttpRequest\b|\bimport\s*\(',text):
            raise ValueError('JavaScript solicita recursos dinámicos incompatibles con autonomía.')
        return re.sub(r'''(["'\x60])((?:\\.|(?!\1)[^\\])*?)\1''',literal,text)
    def media_tag(self,tag,base):
        def attribute(m):
            name,quote,value=m.group(1),m.group(2),html.unescape(m.group(3))
            if not value.strip():
                return m.group(0)
            if name.lower()=='srcset':
                if value.startswith('data:'):
                    return m.group(0)
                candidates=[]
                for part in value.split(','):
                    pieces=part.strip().split()
                    if pieces:
                        candidates.append(' '.join([self.data(pieces[0],base),*pieces[1:]]))
                value=', '.join(candidates)
            else:
                value=self.data(value,base)
            return name+'='+quote+html.escape(value,quote=True)+quote
        return re.sub(r'''\b(src|srcset|poster|href)\s*=\s*(["'])(.*?)\2''',attribute,tag,flags=re.I|re.S)
    def build(self,source):
        source=Path(source).resolve()
        if not source.is_relative_to(self.root):
            raise ValueError('La fuente debe estar dentro del proyecto.')
        text=source.read_text(encoding='utf-8-sig')
        base=source.parent
        scripts=[]
        if re.search(r'<base\b',text,re.I):
            raise ValueError('No se permite base: usa rutas relativas.')
        def link(m):
            attrs=Attributes(m.group(0)).values
            rel=(attrs.get('rel') or '').lower().split()
            if 'stylesheet' in rel:
                path=self.local(attrs.get('href') or '',base)
                css=self.css(path.read_text(encoding='utf-8-sig'),path.parent,(path,))
                if '</style' in css.lower():
                    raise ValueError('Cierre style no seguro dentro del CSS.')
                media=' media="'+html.escape(attrs['media'],quote=True)+'"' if attrs.get('media') else ''
                return '<style'+media+'>\n/* '+path.name+' */\n'+css+'\n</style>'
            if any(x in rel for x in ('preload','prefetch','modulepreload','preconnect','dns-prefetch')):
                return ''
            return self.media_tag(m.group(0),base) if 'icon' in rel else m.group(0)
        def script(m):
            attrs=Attributes(m.group(1)).values
            if not attrs.get('src'):
                code=self.javascript(m.group(2),base)
                return m.group(1)+re.sub(r'</script',r'<\\/script',code,flags=re.I)+'</script>'
            if 'defer' not in attrs or 'async' in attrs or attrs.get('type','').lower() not in ('','text/javascript','application/javascript'):
                raise ValueError('Scripts externos requieren defer, sin async ni módulos.')
            path=self.local(attrs['src'],base)
            scripts.append((path.name,self.javascript(path.read_text(encoding='utf-8-sig'),base)))
            return ''
        text=re.sub(r'(<style\b[^>]*>)(.*?)</style\s*>',lambda m:m.group(1)+self.css(m.group(2),base)+'</style>',text,flags=re.I|re.S)
        text=re.sub(r'<link\b[^>]*>',link,text,flags=re.I)
        text=re.sub(r'(<script\b[^>]*>)(.*?)</script\s*>',script,text,flags=re.I|re.S)
        text=re.sub(r'<(?:img|source|audio|video|input)\b[^>]*>',lambda m:self.media_tag(m.group(0),base),text,flags=re.I)
        text=re.sub(r'\bstyle\s*=\s*(["\'])(.*?)\1',lambda m:'style='+m.group(1)+html.escape(self.css(html.unescape(m.group(2)),base),quote=True)+m.group(1),text,flags=re.I|re.S)
        inline='\n'.join('<script>\n/* '+name+' */\n'+re.sub(r'</script',r'<\\/script',code,flags=re.I)+'\n</script>' for name,code in scripts)
        if not re.search(r'</body\s*>',text,re.I):
            raise ValueError('Falta cierre body.')
        return re.sub(r'</body\s*>',lambda m:inline+'\n</body>',text,count=1,flags=re.I)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',default='index_modular.html')
    parser.add_argument('--output',default='index.html')
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    root=Path(__file__).resolve().parent
    try:
        builder=Builder(root)
        result=builder.build(root/args.source)
        destination=(root/args.output).resolve()
        if not destination.is_relative_to(root) or destination==(root/args.source).resolve():
            raise ValueError('Salida fuera del proyecto o igual a fuente.')
        if not args.check:
            destination.write_text(result,encoding='utf-8')
        print(('Validado sin escribir' if args.check else 'Generado: '+destination.name)+f'; {len(builder.resources)} recursos; {len(result.encode("utf-8")):,} bytes.')
    except (ValueError,OSError) as error:
        print('Error: '+str(error),file=sys.stderr)
        return 1
    return 0
if __name__=='__main__':
    raise SystemExit(main())

