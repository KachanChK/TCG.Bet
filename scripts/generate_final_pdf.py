# -*- coding: utf-8 -*-
from html import escape
from pathlib import Path
from textwrap import dedent

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from generate_final_document import create_diagram_images


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
RENDERED = ROOT / "diagrams" / "rendered"
OUTPUT = DOCS / "TCG.Bet-Documentacao-Final.pdf"


def styles():
    base = getSampleStyleSheet()
    base.add(ParagraphStyle(
        name="DocTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=colors.HexColor("#2E74B5"),
        alignment=TA_CENTER,
        spaceAfter=8,
    ))
    base.add(ParagraphStyle(
        name="Subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=12,
        textColor=colors.HexColor("#1F4D78"),
        alignment=TA_CENTER,
        spaceAfter=12,
    ))
    base.add(ParagraphStyle(
        name="Body",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.6,
        leading=12.2,
        alignment=TA_LEFT,
        spaceAfter=6,
    ))
    base.add(ParagraphStyle(
        name="H1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        textColor=colors.HexColor("#2E74B5"),
        spaceBefore=12,
        spaceAfter=6,
    ))
    base.add(ParagraphStyle(
        name="H2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=colors.HexColor("#2E74B5"),
        spaceBefore=8,
        spaceAfter=5,
    ))
    base.add(ParagraphStyle(
        name="Caption",
        parent=base["Body"],
        fontName="Helvetica",
        fontSize=8,
        textColor=colors.HexColor("#555555"),
        alignment=TA_CENTER,
        spaceAfter=8,
    ))
    base.add(ParagraphStyle(
        name="CodeSmall",
        parent=base["Code"],
        fontName="Courier",
        fontSize=7.2,
        leading=8.8,
        leftIndent=6,
        rightIndent=6,
        spaceBefore=4,
        spaceAfter=8,
    ))
    return base


S = styles()


def p(text):
    return Paragraph(text, S["Body"])


def h1(text):
    return Paragraph(text, S["H1"])


def h2(text):
    return Paragraph(text, S["H2"])


def bullet(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=12) for item in items],
        bulletType="bullet",
        leftIndent=18,
        bulletFontSize=7,
    )


def numbered(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=12) for item in items],
        bulletType="1",
        leftIndent=18,
        bulletFontSize=8,
    )


def code(text):
    return Preformatted(dedent(text).strip(), S["CodeSmall"], maxLineLength=94)


def table(headers, rows, widths):
    data = [[Paragraph(f"<b>{escape(h)}</b>", S["Body"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(escape(str(cell)), S["Body"]) for cell in row])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F2F4F7")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1F4D78")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#B8C2CC")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def image(path, caption):
    img = Image(str(path), width=6.4 * inch, height=3.6 * inch)
    return [img, Paragraph(caption, S["Caption"])]


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawString(inch, 0.45 * inch, "TCG.Bet - Documentacao de Projeto de Software")
    canvas.drawRightString(7.5 * inch, 0.45 * inch, f"Pagina {doc.page}")
    canvas.restoreState()


def build_story():
    create_diagram_images()
    story = []
    story.append(Paragraph("TCG.Bet", S["DocTitle"]))
    story.append(Paragraph("Documentacao Final - Projeto de Software com Arquitetura Justificada", S["Subtitle"]))
    story.append(Paragraph("Grupo: preencher nomes dos integrantes | Repositorio: https://github.com/KachanChK/TCG.Bet", S["Caption"]))
    story.append(Spacer(1, 10))
    story.append(table(["Resumo executivo"], [[
        "Aplicacao web de apostas em eventos futuros. A melhoria arquitetural adotou monolito modular, camadas inspiradas em Clean Architecture/Hexagonal, ADRs, OpenAPI, testes automatizados e padroes GoF aplicados a problemas reais do dominio."
    ]], [6.5 * inch]))

    story.append(h1("Sumario"))
    story.append(numbered([
        "Introducao",
        "Atributos de qualidade e decisoes arquiteturais",
        "Estilo arquitetural",
        "Aplicacao dos principios SOLID",
        "Clean Code",
        "Padroes de projeto GoF",
        "Design de API",
        "Diagramas e modelos",
        "Conclusoes",
        "Referencias bibliograficas",
        "Anexos",
    ]))

    story.append(h1("1. Introducao"))
    story.append(p("O TCG.Bet e um software web para gerenciamento de apostas em eventos futuros. O sistema atende usuarios que desejam criar eventos, apostar, movimentar carteira e acompanhar historico financeiro, alem de moderadores responsaveis por avaliar eventos e finalizar resultados."))
    story.append(p("A escolha do tema e adequada ao trabalho porque envolve regras de negocio nao triviais: autenticacao, autorizacao por papel, operacoes financeiras, historico de carteira, moderacao e calculo de premiacao. Esses pontos permitem demonstrar arquitetura, atributos de qualidade, SOLID, Clean Code e padroes GoF com evidencias objetivas no codigo."))
    story.append(h2("Objetivo geral"))
    story.append(p("Desenvolver e documentar uma aplicacao de apostas em eventos futuros com arquitetura justificada, contrato REST formal e melhoria estrutural do codigo para favorecer manutencao e testabilidade."))
    story.append(h2("Objetivos especificos"))
    story.append(bullet([
        "Permitir cadastro, login e autenticacao por JWT.",
        "Permitir criacao, avaliacao, cancelamento e finalizacao de eventos.",
        "Permitir deposito, saque, aposta e registro de historico financeiro.",
        "Separar regras de negocio de detalhes de infraestrutura.",
        "Documentar decisoes arquiteturais por ADRs e especificar a API com OpenAPI.",
        "Demonstrar SOLID, Clean Code e tres padroes GoF aplicados ao projeto.",
    ]))
    story.append(h2("Problema e publico-alvo"))
    story.append(p("O problema tratado e a ausencia de uma plataforma simples para concentrar eventos de aposta, validacao por moderadores, participacao dos usuarios e controle de saldo. O publico-alvo sao usuarios adultos interessados em apostas sobre eventos futuros e moderadores que controlam a qualidade e o encerramento dos eventos."))

    story.append(h1("2. Atributos de Qualidade e Decisoes Arquiteturais"))
    story.append(h2("2A. Atributos de qualidade prioritarios"))
    story.append(table(["Atributo", "Justificativa", "Decisoes", "Metricas"], [
        ["Seguranca", "O sistema lida com autenticacao, autorizacao e operacoes financeiras.", "JWT, AuthPort/JwtOracleAuthAdapter, validacao de papel e hash de senha com scrypt.", "Rotas privadas exigem Bearer token; tokens expiram em 8h; senhas novas nao ficam em texto puro."],
        ["Confiabilidade e consistencia", "Apostas, saldo e historico financeiro precisam permanecer coerentes.", "Operacoes financeiras em uma conexao Oracle e commit apenas em sucesso; dinheiro em centavos.", "Build sem erros; testes de dominio passando; valores invalidos rejeitados."],
        ["Manutenibilidade e testabilidade", "Regras misturadas com SQL e Express dificultavam testes.", "Camadas domain/application/infrastructure, portas pequenas e padroes GoF.", "Casos de uso dependem de interfaces; 9 testes automatizados."],
    ], [1.15 * inch, 1.75 * inch, 2.15 * inch, 1.45 * inch]))
    story.append(h2("2B. Registro de Decisoes Arquiteturais"))
    story.append(p("Os ADRs ficam versionados na pasta /adrs. O ADR 0005 registra uma decisao modificada: a primeira versao usava servicos com SQL inline; a refatoracao moveu fluxos centrais para casos de uso e portas."))
    story.append(table(["ADR", "Titulo", "Status", "Resumo"], [
        ["0001", "Adotar monolito modular", "Accepted", "Unico deploy com separacao modular."],
        ["0002", "Organizar por camadas", "Accepted", "Separa domain, application, infrastructure e HTTP."],
        ["0003", "REST com OpenAPI", "Accepted", "Formaliza contrato em docs/openapi.yaml."],
        ["0004", "Strategy, Factory e Adapter", "Accepted", "GoF aplicado a problemas reais."],
        ["0005", "Revisar SQL inline", "Accepted", "Modifica decisao inicial e melhora testabilidade."],
    ], [0.55 * inch, 2.05 * inch, 0.85 * inch, 3.05 * inch]))

    story.append(h1("3. Estilo Arquitetural"))
    story.append(h2("3A. Plano macro"))
    story.append(p("O sistema foi mantido como monolito modular. A escolha e coerente com o tamanho do projeto, com a maturidade esperada de um trabalho academico e com a necessidade de consistencia nas operacoes financeiras. Microsservicos aumentariam custo operacional e complicariam transacoes sem beneficio proporcional ao escopo atual."))
    story.append(h2("3B. Plano interno"))
    story.append(p("A organizacao interna e inspirada em Clean Architecture e Arquitetura Hexagonal. As regras puras ficam em domain; os casos de uso e portas ficam em application; os detalhes de OracleDB e JWT ficam em infrastructure; routes e services fazem a entrada HTTP e preservam compatibilidade com a API existente."))
    story.extend(image(RENDERED / "architecture.png", "Figura 1 - Arquitetura geral. Fonte: diagrams/architecture.mmd."))

    story.append(PageBreak())
    story.append(h1("4. Aplicacao dos Principios SOLID"))
    story.append(table(["Principio", "Explicacao", "Trecho aplicado", "Efeito"], [
        ["Single Responsibility", "Uma classe deve ter uma unica razao para mudar.", "MoveWalletFundsUseCase, WalletTransactionFactory e OracleWalletRepository.", "Reduz mistura entre regra, SQL e HTTP."],
        ["Open-Closed", "Aberto para extensao, fechado para modificacao.", "FinishEventUseCase depende de PayoutStrategy.", "Novo algoritmo de premiacao sem alterar o caso de uso."],
        ["Liskov Substitution", "Implementacoes substituem a abstracao sem quebrar clientes.", "OracleWalletRepository implementa WalletRepository.", "Permite repositorio fake em testes."],
        ["Interface Segregation", "Clientes nao dependem de metodos que nao usam.", "WalletRepository, BetRepository, EventRepository e AuthPort.", "Contratos pequenos e baixo acoplamento."],
        ["Dependency Inversion", "Alto nivel depende de abstracoes.", "Casos de uso recebem portas no construtor.", "SQL, JWT e Oracle ficam fora da regra de negocio."],
    ], [1.25 * inch, 1.55 * inch, 2.05 * inch, 1.65 * inch]))
    story.append(code("""
export class FinishEventUseCase {
    constructor(
        private readonly auth: AuthPort,
        private readonly events: EventRepository,
        private readonly bets: BetRepository,
        private readonly wallets: WalletRepository,
        private readonly payoutStrategy: PayoutStrategy
    ) {}
}
"""))

    story.append(h1("5. Clean Code"))
    story.append(p("As praticas de Clean Code foram aplicadas principalmente nos fluxos que concentram risco de negocio: carteira, aposta e finalizacao de eventos."))
    story.append(table(["Pratica", "Evidencia", "Efeito"], [
        ["Nomes claros", "MoveWalletFundsUseCase, PlaceBetUseCase, FinishEventUseCase.", "A intencao aparece no proprio nome."],
        ["Funcoes pequenas", "toCents, assertPositiveCents e metodos da Factory.", "Regras curtas e testaveis."],
        ["Reducao de duplicacao", "Deposito e saque usam MoveWalletFundsUseCase.", "Evita logicas financeiras duplicadas."],
        ["Baixo acoplamento", "Casos de uso dependem de portas.", "Infraestrutura pode mudar com menor impacto."],
        ["Erros explicitos", "UseCaseResult com ok/fail.", "Fluxos retornam erro controlado."],
    ], [1.45 * inch, 2.7 * inch, 2.35 * inch]))
    story.append(code("""
export function toCents(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("O valor deve ser maior que zero.");
    }
    return Math.round(amount * 100);
}
"""))

    story.append(h1("6. Padroes de Projeto GoF"))
    story.append(h2("Strategy - comportamento"))
    story.append(p("Problema: o calculo de premiacao pode mudar. A solucao foi criar PayoutStrategy e uma implementacao PoolPayoutStrategy. Beneficio: extensibilidade. Custo: mais uma abstracao para entender."))
    story.append(code("""
export interface PayoutStrategy {
    calculatePayouts(winningGuess: string, bets: SettledBet[]): Payout[];
}

export class PoolPayoutStrategy implements PayoutStrategy {
    calculatePayouts(winningGuess: string, bets: SettledBet[]): Payout[] {
        const totalPool = bets.reduce((sum, bet) => sum + bet.betAmountInCents, 0);
        // distribuicao proporcional aos vencedores
    }
}
"""))
    story.append(h2("Factory - criacao"))
    story.append(p("Problema: transacoes de carteira precisam ser consistentes quanto a tipo e validacao. A Factory padroniza deposito, saque, aposta e ganho. Beneficio: centralizacao da criacao. Custo: chamada indireta em vez de objeto literal."))
    story.append(code("""
export class WalletTransactionFactory {
    static deposit(walletId: number, amountInCents: number): WalletTransaction {
        return this.create(walletId, amountInCents, "Deposito");
    }
    static win(walletId: number, amountInCents: number): WalletTransaction {
        return this.create(walletId, amountInCents, "Ganho");
    }
}
"""))
    story.append(h2("Adapter - estrutura"))
    story.append(p("Problema: casos de uso nao devem depender diretamente de OracleDB, JWT ou bibliotecas externas. Os adapters traduzem essas APIs para portas internas. Beneficio: substituicao e teste. Custo: mais classes de infraestrutura."))
    story.append(code("""
export class OracleWalletRepository implements WalletRepository {
    constructor(private readonly connection: OracleDB.Connection) {}

    async findByOwnerId(ownerId: number): Promise<StoredWallet | null> {
        const result = await this.connection.execute(
            `SELECT id, balance, owner_id FROM wallets WHERE owner_id = :ownerId`,
            [ownerId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
    }
}
"""))
    story.extend(image(RENDERED / "gof-class-diagram.png", "Figura 2 - Classes dos padroes GoF. Fonte: diagrams/gof-class-diagram.mmd."))

    story.append(h1("7. Design de API"))
    story.append(p("O estilo escolhido e REST, pois o sistema possui recursos claros como account, wallet, event, bet e moderation. REST combina com Express e com ferramentas de teste e documentacao amplamente conhecidas."))
    story.append(bullet([
        "Especificacao formal: docs/openapi.yaml em OpenAPI 3.0.3.",
        "Autenticacao: Bearer JWT no header Authorization.",
        "Versionamento: sem versao explicita na URL nesta iteracao; o contrato e versionado pelo campo info.version do OpenAPI.",
        "Convencao de erro: respostas JSON com propriedade error.",
        "Paginacao: ainda nao aplicada; recomendada para endpoints de listagem em uma proxima iteracao.",
    ]))
    story.append(table(["Endpoint", "Responsabilidade"], [
        ["POST /account/signUp", "Cadastro de usuario."],
        ["POST /account/login", "Login e emissao de token."],
        ["POST /account/addFunds", "Deposito em carteira."],
        ["POST /account/withdrawFunds", "Saque de carteira."],
        ["POST /event/addEvent", "Criacao de evento pendente."],
        ["POST /event/bet", "Realizacao de aposta."],
        ["POST /mod/evaluateEvent", "Aprovacao ou reprovacao por moderador."],
        ["POST /mod/finishEvent", "Finalizacao e distribuicao de ganhos."],
    ], [2.2 * inch, 4.3 * inch]))

    story.append(h1("8. Diagramas e Modelos"))
    story.append(p("Os diagramas foram mantidos como codigo em Mermaid na pasta /diagrams, conforme recomendado no enunciado. Eles incluem visao geral, classes dos padroes GoF e sequencia do fluxo central de aposta."))
    story.extend(image(RENDERED / "place-bet-sequence.png", "Figura 3 - Sequencia do fluxo de aposta. Fonte: diagrams/place-bet-sequence.mmd."))

    story.append(h1("9. Conclusoes"))
    story.append(p("A refatoracao arquitetural tornou o projeto mais defensavel: os fluxos centrais passaram a demonstrar separacao de responsabilidades, inversao de dependencias, padroes GoF aplicados a problemas reais e testes automatizados de dominio."))
    story.append(p("A pratica mais efetiva foi separar regra de negocio de infraestrutura. Isso permitiu testar premiacao e transacoes de carteira sem depender de OracleDB ou servidor Express."))
    story.append(h2("Limitacoes e proximas melhorias"))
    story.append(bullet([
        "Usuarios legados com senha antiga devem passar por migracao ou troca obrigatoria de senha.",
        "Validacao de entrada deveria ser centralizada com Zod, Joi ou class-validator.",
        "Nem todos os servicos legados foram migrados integralmente para casos de uso.",
        "Faltam testes de integracao para rotas Express e persistencia Oracle.",
        "Os endpoints de listagem ainda nao possuem paginacao.",
        "Mensagens e arquivos antigos possuem alguns problemas de encoding em acentos.",
        "O livro-texto exato da disciplina e os nomes dos integrantes devem ser preenchidos antes da entrega.",
    ]))

    story.append(h1("10. Referencias Bibliograficas"))
    for ref in [
        "GAMMA, Erich; HELM, Richard; JOHNSON, Ralph; VLISSIDES, John. Design Patterns: Elements of Reusable Object-Oriented Software. Reading: Addison-Wesley, 1994.",
        "MARTIN, Robert C. Clean Code: A Handbook of Agile Software Craftsmanship. Upper Saddle River: Prentice Hall, 2008.",
        "MARTIN, Robert C. Clean Architecture: A Craftsman's Guide to Software Structure and Design. Boston: Prentice Hall, 2017.",
        "FOWLER, Martin. Patterns of Enterprise Application Architecture. Boston: Addison-Wesley, 2002.",
        "INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO/IEC 25010:2023: Systems and software engineering - Systems and software Quality Requirements and Evaluation (SQuaRE) - Product quality model. Geneva: ISO, 2023.",
        "NYGARD, Michael. Documenting Architecture Decisions. 2011. Disponivel em: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions. Acesso em: 10 jun. 2026.",
        "LIVRO-TEXTO DA DISCIPLINA. Referencia a completar conforme bibliografia indicada pelo professor.",
    ]:
        story.append(p(ref))

    story.append(h1("Anexos"))
    story.append(bullet([
        "Repositorio Git: https://github.com/KachanChK/TCG.Bet",
        "Pasta de ADRs: /adrs",
        "Pasta de diagramas: /diagrams",
        "Contrato de API: /docs/openapi.yaml",
        "README de instalacao e execucao: /README.md",
        "Testes automatizados: /tests",
        "Comandos verificados: npm.cmd run build e npm.cmd test",
    ]))
    return story


def main():
    DOCS.mkdir(exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
        title="TCG.Bet - Documentacao Final",
        author="TCG.Bet",
    )
    doc.build(build_story(), onFirstPage=header_footer, onLaterPages=header_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
