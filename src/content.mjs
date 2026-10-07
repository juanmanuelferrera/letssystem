// content.mjs — Todo el texto de la web en ES/EN/FR/PT. Editable sin tocar el código.
// Cada texto se escribe con t('es','en','fr','pt'); sólo hay que añadir un idioma
// a LANGS y una traducción por texto para soportarlo.
export const LANGS = ['es', 'en', 'fr', 'pt'];
export const LANG_NAMES = { es: 'Español', en: 'English', fr: 'Français', pt: 'Português' };
export const LANG_FLAGS = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷', pt: '🇵🇹' };

// Listas de textos por idioma (para bloques que son una lista, no una frase).
const L = (es, en = es, fr = es, pt = es) => ({ es, en, fr, pt });

export function content(lang = 'es') {
  const code = String(lang || 'es').slice(0, 2).toLowerCase();
  const i = Math.max(0, LANGS.indexOf(code));
  const t = (...a) => (a[i] != null ? a[i] : a[0]);
  const out = {
    lang: LANGS[i],
    meta: {
      title: t(
        'Lets System — Sistemas de intercambio con moneda propia',
        'Lets System — Exchange systems with their own currency',
        'Lets System — Systèmes d’échange avec leur propre monnaie',
        'Lets System — Sistemas de troca com moeda própria'
      ),
      tagline: t(
        'Una plataforma para alojar muchos sistemas de intercambio, cada uno con su propia moneda.',
        'A platform hosting many exchange systems, each with its own currency.',
        'Une plateforme hébergeant de nombreux systèmes d’échange, chacun avec sa propre monnaie.',
        'Uma plataforma que aloja muitos sistemas de troca, cada um com a sua própria moeda.'
      ),
    },
    nav: {
      home: t('Inicio', 'Home', 'Accueil', 'Início'),
      presentation: t('Presentación', 'Overview', 'Présentation', 'Apresentação'),
      ideas: t('Ideas para ofrecer', 'Ideas to offer', 'Des idées à offrir', 'Ideias para oferecer'),
      faq: t('FAQ', 'FAQ', 'FAQ', 'FAQ'),
      login: t('Entrar', 'Log in', 'Connexion', 'Entrar'),
      signup: t('Apuntarse', 'Join', 'S’inscrire', 'Inscrever-se'),
      admin: t('Administración', 'Admin', 'Administration', 'Administração'),
      profile: t('Mi cuenta', 'My account', 'Mon compte', 'A minha conta'),
      logout: t('Salir', 'Log out', 'Déconnexion', 'Sair'),
      yellow: t('Páginas amarillas', 'Yellow pages', 'Pages jaunes', 'Páginas amarelas'),
      accounts: t('Cuentas', 'Accounts', 'Comptes', 'Contas'),
    },
    home: {
      h1: t('Qué es un LETS', 'What LETS is', 'Qu’est-ce qu’un LETS', 'O que é um LETS'),
      lead: t(
        'LETS (Local Exchange Trading System) es un sistema de intercambio local: un grupo de personas que se juntan para compartir servicios, conocimientos y cosas sin usar dinero, con una unidad de cuenta propia. Esta web aloja muchos sistemas así, cada uno con su moneda, su comunidad y su administrador.',
        'LETS (Local Exchange Trading System) is a local exchange system: a group of people who get together to share services, knowledge and things without money, using their own unit of account. This site hosts many such systems, each with its own currency, community and administrator.',
        'LETS (Local Exchange Trading System) est un système d’échange local : un groupe de personnes qui se réunissent pour partager des services, des savoirs et des choses sans utiliser d’argent, avec leur propre unité de compte. Ce site héberge de nombreux systèmes de ce type, chacun avec sa monnaie, sa communauté et son administrateur.',
        'LETS (Local Exchange Trading System) é um sistema de troca local: um grupo de pessoas que se juntam para partilhar serviços, conhecimentos e coisas sem usar dinheiro, com uma unidade de conta própria. Este site aloja muitos sistemas assim, cada um com a sua moeda, a sua comunidade e o seu administrador.'
      ),
      nearTitle: t(
        'Estos son los grupos de esta zona. Apúntate al que quieras.',
        'These are the groups in this area. Join whichever you like.',
        'Voici les groupes de cette zone. Inscrivez-vous à celui que vous voulez.',
        'Estes são os grupos desta zona. Inscreva-se no que quiser.'
      ),
      why: {
        h: t('Por qué no basta con hacer favores', 'Why favours alone are not enough', 'Pourquoi les faveurs ne suffisent pas', 'Porque os favores não bastam'),
        p: t(
          'A una persona le puedes hacer un favor una vez, dos, tres… pero llega un punto en que necesitamos que haya un intercambio, sacar algo de ello: es humano. El LETS lo resuelve. Llevas a alguien al aeropuerto tres veces sin cobrarle nada y esos créditos los cambias por otra cosa que te interesa. El favor no se convierte en deuda: se convierte en moneda.',
          'You can do someone a favour once, twice, three times… but a point comes when we need an exchange, to get something out of it: that is human nature. LETS solves it. You drive someone to the airport three times without charging them a thing, and you trade those credits for something else you need. The favour does not become a debt: it becomes currency.',
          'On peut rendre service à quelqu’un une fois, deux, trois… mais vient un moment où l’on a besoin d’un échange, d’en retirer quelque chose : c’est humain. Le LETS le résout. Vous conduisez quelqu’un à l’aéroport trois fois sans rien lui facturer, et ces crédits, vous les échangez contre autre chose qui vous intéresse. Le service ne devient pas une dette : il devient monnaie.',
          'Pode fazer um favor a alguém uma vez, duas, três… mas chega um momento em que precisamos de uma troca, de tirar algo disso: é humano. O LETS resolve-o. Leva alguém ao aeroporto três vezes sem cobrar nada, e esses créditos troca-os por outra coisa que lhe interessa. O favor não se torna dívida: torna-se moeda.'
        ),
      },
      ctaJoin: t('Apuntarme a un sistema', 'Join a system', 'Rejoindre un système', 'Inscrever-me num sistema'),
      ctaSystems: t('Ver sistemas', 'See systems', 'Voir les systèmes', 'Ver sistemas'),
      ctaPresentation: t('Ver la presentación', 'See the overview', 'Voir la présentation', 'Ver a apresentação'),
      ctaIdeas: t('¿No sabes qué ofrecer? Mira la lista de ideas', 'Not sure what to offer? See the list of ideas', 'Vous ne savez pas quoi offrir ? Voir la liste d’idées', 'Não sabe o que oferecer? Ver a lista de ideias'),
      ctaNewSystem: t('Crear un grupo', 'Create a group', 'Créer un groupe', 'Criar um grupo'),
      videoTitle: t('Cómo funciona el intercambio', 'How the exchange works', 'Comment fonctionne l’échange', 'Como funciona a troca'),
      videoCaption: t(
        'En menos de dos minutos: qué es la moneda propia, cómo se paga a una persona hoy y se cobra de otra mañana, y por qué no es trueque ni banco de tiempo.',
        'In under two minutes: what the system currency is, how you pay one person today and get paid by another tomorrow, and why it is neither barter nor a time bank.',
        'En moins de deux minutes : ce qu’est la monnaie propre, comment on paie une personne aujourd’hui et on est payé par une autre demain, et pourquoi ce n’est ni du troc ni une banque de temps.',
        'Em menos de dois minutos: o que é a moeda própria, como se paga a uma pessoa hoje e se recebe de outra amanhã, e porque não é troca direta nem banco de tempo.'
      ),
    },
    presentation: {
      title: t('Presentación', 'Overview', 'Présentation', 'Apresentação'),
    },
    how: {
      title: t('Cómo funciona', 'How it works', 'Comment ça marche', 'Como funciona'),
      summary: t(
        'Ni trueque ni banco de tiempo. Moneda propia, sin euros y sin ánimo de lucro. Saldos públicos y un administrador que responde.',
        'Neither barter nor a time bank. Its own currency — no euros, non-profit. Public balances and an administrator who answers.',
        'Ni troc ni banque de temps. Une monnaie propre, sans euros et à but non lucratif. Soldes publics et un administrateur qui répond.',
        'Nem troca nem banco de tempo. Moeda própria, sem euros e sem fins lucrativos. Saldos públicos e um administrador que responde.'
      ),
      blocks: [
        {
          h: t('1. Te apuntas a un sistema', '1. You join a system', '1. Vous rejoignez un système', '1. Inscreve-se num sistema'),
          p: t(
            'Rellenas el formulario y aceptas las condiciones. Al entrar, tu cuenta se abre con el bono de bienvenida en la moneda del sistema.',
            'You fill in the form and accept the terms. On entry your account opens with the welcome bonus in the system currency.',
            'Vous remplissez le formulaire et acceptez les conditions. À l’entrée, votre compte s’ouvre avec le bonus de bienvenue dans la monnaie du système.',
            'Preenche o formulário e aceita as condições. Ao entrar, a sua conta abre com o bónus de boas-vindas na moeda do sistema.'
          ),
        },
        {
          h: t('2. Publicas lo que ofreces y lo que necesitas', '2. You post what you offer and what you need', '2. Vous publiez ce que vous offrez et ce dont vous avez besoin', '2. Publica o que oferece e o que precisa'),
          p: t(
            'El catálogo es un tablón: unos ofrecen lo que saben hacer y piden lo que necesitan. Se ve lo que cada uno puede dar y pedir.',
            'The catalogue is a noticeboard: people offer what they can do and ask for what they need. You see what each one can give and ask for.',
            'Le catalogue est un tableau d’affichage : chacun propose ce qu’il sait faire et demande ce dont il a besoin. On voit ce que chacun peut donner et demander.',
            'O catálogo é um quadro de anúncios: cada um oferece o que sabe fazer e pede o que precisa. Vê-se o que cada um pode dar e pedir.'
          ),
        },
        {
          h: t('3. Intercambias y se anota en unidades', '3. You exchange and it is recorded in units', '3. Vous échangez et c’est enregistré en unités', '3. Troca e é registado em unidades'),
          p: t(
            'Las dos partes acuerdan libremente el valor. Quien recibe el servicio paga en unidades; quien lo da las cobra. Nadie está obligado a aceptar un intercambio.',
            'Both parties freely agree the value. The one who receives the service pays in units; the one who gives it earns them. Nobody is obliged to accept an exchange.',
            'Les deux parties conviennent librement de la valeur. Celui qui reçoit le service paie en unités ; celui qui le rend les encaisse. Personne n’est obligé d’accepter un échange.',
            'As duas partes acordam livremente o valor. Quem recebe o serviço paga em unidades; quem o presta recebe-as. Ninguém é obrigado a aceitar uma troca.'
          ),
        },
        {
          h: t('4. El saldo es un crédito de la comunidad', '4. The balance is a credit from the community', '4. Le solde est un crédit de la communauté', '4. O saldo é um crédito da comunidade'),
          p: t(
            'Puedes gastar aunque tengas poco saldo: hay un límite de crédito. Un saldo negativo no es una deuda bancaria, sino un servicio pendiente para la comunidad.',
            'You can spend even with a low balance: there is a credit limit. A negative balance is not a bank debt, but a service still owed to the community.',
            'Vous pouvez dépenser même avec un solde faible : il existe une limite de crédit. Un solde négatif n’est pas une dette bancaire, mais un service encore dû à la communauté.',
            'Pode gastar mesmo com pouco saldo: existe um limite de crédito. Um saldo negativo não é uma dívida bancária, mas um serviço ainda devido à comunidade.'
          ),
        },
      ],
    },
    faq: {
      title: t('Preguntas frecuentes', 'Frequently asked questions', 'Questions fréquentes', 'Perguntas frequentes'),
      items: [
        {
          q: t('¿Esto es trueque?', 'Is this barter?', 'Est-ce du troc ?', 'Isto é troca direta?'),
          a: t(
            'No. En el trueque, dos personas intercambian en el momento cosas de valor equivalente. Aquí la unidad de intercambio permite transferir servicios entre personas distintas, en momentos distintos y con valores distintos.',
            'No. In barter, two people exchange goods of equal value at the same moment. Here the exchange unit lets you transfer services between different people, at different times and with different values.',
            'Non. Dans le troc, deux personnes échangent au même moment des biens de valeur équivalente. Ici, l’unité d’échange permet de transférer des services entre des personnes différentes, à des moments différents et avec des valeurs différentes.',
            'Não. Na troca direta, duas pessoas trocam no momento coisas de valor equivalente. Aqui a unidade de troca permite transferir serviços entre pessoas diferentes, em momentos diferentes e com valores diferentes.'
          ),
        },
        {
          q: t('¿Quién fija los precios?', 'Who sets the prices?', 'Qui fixe les prix ?', 'Quem fixa os preços?'),
          a: t(
            'La cantidad de cada transacción la fijan siempre, de buen grado, los dos participantes. Nadie está obligado a aceptar un intercambio.',
            'The amount of each transaction is always freely agreed by both participants. Nobody is obliged to accept an exchange.',
            'Le montant de chaque transaction est toujours fixé librement par les deux participants. Personne n’est obligé d’accepter un échange.',
            'O montante de cada transação é sempre fixado livremente pelos dois participantes. Ninguém é obrigado a aceitar uma troca.'
          ),
        },
        {
          q: t('¿Es un banco de tiempo?', 'Is this a time bank?', 'Est-ce une banque de temps ?', 'Isto é um banco de tempo?'),
          a: t(
            'No, y conviene explicar por qué. Un banco de tiempo mide el intercambio en horas: da igual quién seas, una hora tuya vale una hora mía. Sobre el papel suena igualitario, pero en la práctica no funciona: la hora de un especialista —un abogado, un médico, un traductor, un músico— no vale lo mismo que la hora de una tarea sencilla, y quien aporta más acaba sintiéndose tratado injustamente y deja de participar. Este sistema no cuenta horas: usa una moneda propia de la comunidad en la que cada intercambio vale lo que las dos partes acuerdan libremente. Así cada uno recibe algo justo por lo que da, sin forzar a que valga lo mismo lo que no es igual.',
            'No, and it is worth explaining why. A time bank measures exchange in hours: whatever your skill, one hour of yours equals one hour of mine. On paper it sounds egalitarian, but in practice it does not work: an hour of a specialist —a lawyer, a doctor, a translator, a musician— is not worth the same as an hour of a simple task, and whoever contributes more ends up feeling unfairly treated and stops taking part. This system does not count hours: it uses a currency of the community in which each exchange is worth whatever both parties freely agree. That way each person receives something fair for what they give, without forcing things that are not equal to be worth the same.',
            'Non, et il vaut la peine d’expliquer pourquoi. Une banque de temps mesure l’échange en heures : peu importe qui vous êtes, une heure de vous vaut une heure de moi. Sur le papier, cela semble égalitaire, mais en pratique cela ne fonctionne pas : l’heure d’un spécialiste —un avocat, un médecin, un traducteur, un musicien— ne vaut pas la même chose que l’heure d’une tâche simple, et celui qui apporte le plus finit par se sentir traité injustement et cesse de participer. Ce système ne compte pas les heures : il utilise une monnaie propre à la communauté dans laquelle chaque échange vaut ce que les deux parties conviennent librement. Ainsi chacun reçoit quelque chose de juste pour ce qu’il donne, sans forcer à valoir la même chose ce qui n’est pas égal.',
            'Não, e vale a pena explicar porquê. Um banco de tempo mede a troca em horas: seja quem for, uma hora sua vale uma hora minha. No papel parece igualitário, mas na prática não funciona: a hora de um especialista —um advogado, um médico, um tradutor, um músico— não vale o mesmo que a hora de uma tarefa simples, e quem contribui mais acaba por se sentir tratado injustamente e deixa de participar. Este sistema não conta horas: usa uma moeda própria da comunidade em que cada troca vale o que as duas partes acordam livremente. Assim cada um recebe algo justo pelo que dá, sem forçar a que valha o mesmo o que não é igual.'
          ),
        },
        {
          q: t('¿Cuánto cuesta pertenecer?', 'How much does it cost to belong?', 'Combien coûte l’adhésion ?', 'Quanto custa pertencer?'),
          a: t(
            'La membresía es totalmente gratis. No se paga en euros: se paga en la moneda del propio sistema.',
            'Membership is completely free. You do not pay in euros: you pay in the system currency itself.',
            'L’adhésion est totalement gratuite. On ne paie pas en euros : on paie dans la monnaie du système lui-même.',
            'A adesão é totalmente gratuita. Não se paga em euros: paga-se na moeda do próprio sistema.'
          ),
        },
        {
          q: t('¿De dónde saco el saldo para empezar a intercambiar?', 'Where do I get a balance to start trading?', 'Où est-ce que je trouve un solde pour commencer à échanger ?', 'De onde tiro o saldo para começar a trocar?'),
          a: t(
            'Al apuntarte recibes un bono de bienvenida que se ingresa en tu cuenta. Además puedes gastar en negativo hasta un límite de crédito, pensado para que el sistema no se bloquee cuando alguien necesita más de lo que tiene.',
            'When you join you receive a welcome bonus credited to your account. You can also spend into the negative up to a credit limit, so the system does not stall when someone needs more than they have.',
            'À l’inscription, vous recevez un bonus de bienvenue crédité sur votre compte. Vous pouvez aussi dépenser en négatif jusqu’à une limite de crédit, prévue pour que le système ne se bloque pas quand quelqu’un a besoin de plus qu’il ne possède.',
            'Ao inscrever-se recebe um bónus de boas-vindas creditado na sua conta. Além disso, pode gastar em negativo até um limite de crédito, pensado para que o sistema não bloqueie quando alguém precisa de mais do que tem.'
          ),
        },
        {
          q: t('¿Qué pasa si un usuario se va del sistema?', 'What happens if a user leaves the system?', 'Que se passe-t-il si un utilisateur quitte le système ?', 'O que acontece se um utilizador sair do sistema?'),
          a: t(
            'Su saldo queda en su cuenta, que pasa a inactiva. Si el saldo es positivo puede gastarlo hasta agotarlo o pedir a la administración que lo transfiera a otro miembro. Si es negativo, no es una deuda en euros: es un servicio pendiente para la comunidad, y queda anotado como tal. Si vuelve, lo retoma; si no vuelve, el grupo lo tiene presente y puede hacer excepciones o darle de baja conservando esa memoria. La clave es que, al ser un sistema local donde las personas se conocen, la confianza y la responsabilidad moral bastan en la práctica.',
            'Their balance stays in their account, which becomes inactive. If the balance is positive they can spend it down or ask the administration to transfer it to another member. If it is negative, it is not a debt in euros: it is a service still owed to the community, and is recorded as such. If they return, they pick it up again; if not, the group keeps it in mind and may make exceptions or close the account while remembering it. The key is that, being a local system where people know each other, trust and moral responsibility are enough in practice.',
            'Son solde reste sur son compte, qui devient inactif. Si le solde est positif, il peut le dépenser jusqu’à épuisement ou demander à l’administration de le transférer à un autre membre. S’il est négatif, ce n’est pas une dette en euros : c’est un service encore dû à la communauté, et il est enregistré comme tel. S’il revient, il le reprend ; sinon, le groupe en garde la mémoire et peut faire des exceptions ou clôturer le compte en conservant ce souvenir. L’essentiel est que, s’agissant d’un système local où les personnes se connaissent, la confiance et la responsabilité morale suffisent en pratique.',
            'O seu saldo fica na sua conta, que passa a inativa. Se o saldo for positivo, pode gastá-lo até o esgotar ou pedir à administração que o transfira para outro membro. Se for negativo, não é uma dívida em euros: é um serviço ainda devido à comunidade, e fica registado como tal. Se voltar, retoma-o; se não voltar, o grupo tem-no presente e pode fazer exceções ou dar-lhe baixa conservando essa memória. O essencial é que, sendo um sistema local onde as pessoas se conhecem, a confiança e a responsabilidade moral bastam na prática.'
          ),
        },
        {
          q: t('¿Es legal? ¿Se tienen que pagar impuestos por las transacciones?', 'Is it legal? Must taxes be paid on transactions?', 'Est-ce légal ? Faut-il payer des impôts sur les transactions ?', 'É legal? Têm de se pagar impostos pelas transações?'),
          a: t(
            'El sistema es transparente: todo queda registrado y consultable por los socios, no hay nada oculto. Y la respuesta es clara: si el gobierno o las autoridades desean cobrar impuestos, pueden llegar a hacerlo. Aquí está la particularidad: tendrán que cobrarlos en la moneda del sistema. Como esa moneda no es de curso legal y solo circula dentro de la comunidad, cobrar impuestos en ella no detrae riqueza de la economía ordinaria: la multiplica, porque amplía la circulación de la propia unidad en lugar de sacar euros del grupo. Dicho de otro modo: cuanto más entra lo público en la moneda interna, más se multiplica esa riqueza comunitaria. Esto no es asesoría fiscal; cada socio consulta lo que necesite con su asesor.',
            'The system is transparent: everything is recorded and visible to members, nothing is hidden. And the answer is clear: if the government or the authorities wish to collect taxes, they can come to do so. Here is the particular point: they will have to collect them in the system currency. Since that currency is not legal tender and circulates only inside the community, collecting taxes in it does not drain wealth from the ordinary economy: it multiplies it, because it widens the circulation of the unit itself instead of taking euros out of the group. Put another way: the more the public sphere enters the internal currency, the more that community wealth is multiplied. This is not tax advice; each member consults their own adviser as needed.',
            'Le système est transparent : tout est enregistré et consultable par les membres, rien n’est caché. Et la réponse est claire : si le gouvernement ou les autorités souhaitent percevoir des impôts, ils peuvent le faire. Voici la particularité : ils devront les percevoir dans la monnaie du système. Comme cette monnaie n’a pas cours légal et ne circule qu’à l’intérieur de la communauté, y percevoir des impôts ne retire pas de richesse à l’économie ordinaire : elle la multiplie, car cela élargit la circulation de l’unité elle-même au lieu de sortir des euros du groupe. Autrement dit : plus le public entre dans la monnaie interne, plus cette richesse communautaire se multiplie. Ceci n’est pas un conseil fiscal ; chaque membre consulte son conseiller selon ses besoins.',
            'O sistema é transparente: tudo fica registado e consultável pelos sócios, não há nada oculto. E a resposta é clara: se o governo ou as autoridades quiserem cobrar impostos, podem vir a fazê-lo. Aqui está a particularidade: terão de os cobrar na moeda do sistema. Como essa moeda não é de curso legal e só circula dentro da comunidade, cobrar impostos nela não retira riqueza da economia comum: multiplica-a, porque amplia a circulação da própria unidade em vez de tirar euros do grupo. Por outras palavras: quanto mais o público entra na moeda interna, mais essa riqueza comunitária se multiplica. Isto não é aconselhamento fiscal; cada sócio consulta o que precisar com o seu assessor.'
          ),
        },
        {
          q: t('¿Puede uno quedarse en saldo negativo para siempre?', 'Can someone stay in negative balance forever?', 'Peut-on rester en solde négatif pour toujours ?', 'Pode alguém ficar em saldo negativo para sempre?'),
          a: t(
            'El grupo fija un límite de crédito. Si un miembro llega a ese límite, se le ayuda a superarlo; el objetivo no es castigar, sino que el sistema siga funcionando para todos.',
            'The group sets a credit limit. If a member reaches it, they are helped to overcome it; the aim is not to punish but to keep the system working for everyone.',
            'Le groupe fixe une limite de crédit. Si un membre l’atteint, on l’aide à la dépasser ; le but n’est pas de punir, mais que le système continue de fonctionner pour tous.',
            'O grupo fixa um limite de crédito. Se um membro o atingir, é ajudado a ultrapassá-lo; o objetivo não é castigar, mas que o sistema continue a funcionar para todos.'
          ),
        },
        {
          q: t('¿Qué impide marcharse con una cuenta en negativo?', 'What stops me leaving with a negative balance?', 'Qu’est-ce qui empêche de partir avec un compte négatif ?', 'O que impede sair com uma conta em negativo?'),
          a: t(
            'Un débito es un servicio pendiente de realizar para la comunidad. Al ser un sistema local donde la gente se conoce, surge la confianza y la responsabilidad moral. En la práctica, eso basta para que ese comportamiento no ocurra.',
            'A debit is a service still to be performed for the community. Since this is a local system where people know each other, trust and moral responsibility arise. In practice that is enough for such behaviour not to happen.',
            'Un débit est un service encore à rendre à la communauté. S’agissant d’un système local où les gens se connaissent, la confiance et la responsabilité morale apparaissent. En pratique, cela suffit pour que ce comportement ne se produise pas.',
            'Um débito é um serviço ainda por prestar à comunidade. Sendo um sistema local onde as pessoas se conhecem, surge a confiança e a responsabilidade moral. Na prática, isso basta para que esse comportamento não aconteça.'
          ),
        },
        {
          q: t('¿Hay algún servicio mínimo obligatorio?', 'Is there a minimum service requirement?', 'Y a-t-il un service minimum obligatoire ?', 'Há algum serviço mínimo obrigatório?'),
          a: t(
            'No. No hay obligación de dar ni de recibir. No hay servicios mínimos que prestar.',
            'No. There is no obligation to give or to receive. There are no minimum services to perform.',
            'Non. Il n’y a aucune obligation de donner ni de recevoir. Il n’y a pas de services minimums à rendre.',
            'Não. Não há obrigação de dar nem de receber. Não há serviços mínimos a prestar.'
          ),
        },
        {
          q: t('¿Cómo compruebo los saldos?', 'How do I check balances?', 'Comment vérifier les soldes ?', 'Como verifico os saldos?'),
          a: t(
            'El saldo de las cuentas es público para los socios y aparece en el listado de cada sistema dentro de la web.',
            'Account balances are public to members and are listed per system on the website.',
            'Le solde des comptes est public pour les membres et apparaît dans la liste de chaque système sur le site.',
            'O saldo das contas é público para os sócios e aparece na listagem de cada sistema dentro do site.'
          ),
        },
        {
          q: t('¿Qué pasa si me quedo sin saldo?', 'What happens if I run out of balance?', 'Que se passe-t-il si je n’ai plus de solde ?', 'O que acontece se ficar sem saldo?'),
          a: t(
            'Puedes seguir gastando: existe un límite de crédito. Gastar de más no es un impago, es un compromiso de devolverlo a la comunidad con un servicio futuro.',
            'You can keep spending: there is a credit limit. Overspending is not a default, it is a commitment to return it to the community with a future service.',
            'Vous pouvez continuer à dépenser : il existe une limite de crédit. Dépenser plus n’est pas un défaut de paiement, c’est l’engagement de le rendre à la communauté par un service futur.',
            'Pode continuar a gastar: existe um limite de crédito. Gastar a mais não é um incumprimento, é o compromisso de o devolver à comunidade com um serviço futuro.'
          ),
        },
        {
          q: t('¿Quién es el administrador y cuánto cobra?', 'Who is the administrator and what are they paid?', 'Qui est l’administrateur et combien est-il payé ?', 'Quem é o administrador e quanto ganha?'),
          a: t(
            'Cada sistema elige al suyo: normalmente quien lo funda. Se encarga de las altas, del orden y de atender dudas e incidencias. Cobra por su trabajo en puntos del propio sistema (por ejemplo, unos puntos por transacción), no en euros. Los puntos miden su aportación y los sostienen los propios miembros al usar el sistema.',
            'Each system chooses its own: usually whoever founds it. They handle sign-ups, order, and questions or incidents. They are paid for their work in points of the system itself (for example, some points per transaction), not in euros. Points measure their contribution and are sustained by the members themselves as they use the system.',
            'Chaque système choisit le sien : en général celui qui le fonde. Il s’occupe des inscriptions, de l’ordre et des questions ou incidents. Il est rémunéré pour son travail en points du système lui-même (par exemple, quelques points par transaction), pas en euros. Les points mesurent sa contribution et sont soutenus par les membres eux-mêmes lorsqu’ils utilisent le système.',
            'Cada sistema escolhe o seu: normalmente quem o funda. Encarrega-se das inscrições, da ordem e de atender dúvidas e incidências. É pago pelo seu trabalho em pontos do próprio sistema (por exemplo, alguns pontos por transação), não em euros. Os pontos medem a sua contribuição e são sustentados pelos próprios membros ao usar o sistema.'
          ),
        },
        {
          q: t('¿Cómo se sufragan los gastos de administración?', 'How are administrative costs covered?', 'Comment sont couverts les frais d’administration ?', 'Como são suportadas as despesas de administração?'),
          a: t(
            'Con esos puntos del sistema, no con euros. La membresía sigue siendo gratis; lo que sostiene la administración es el propio uso de la moneda.',
            'With those system points, not with euros. Membership stays free; what supports the administration is the use of the currency itself.',
            'Avec ces points du système, pas avec des euros. L’adhésion reste gratuite ; ce qui soutient l’administration, c’est l’usage même de la monnaie.',
            'Com esses pontos do sistema, não com euros. A adesão continua gratuita; o que sustenta a administração é o próprio uso da moeda.'
          ),
        },
        {
          q: t('¿Puedo crear mi propio sistema?', 'Can I create my own system?', 'Puis-je créer mon propre système ?', 'Posso criar o meu próprio sistema?'),
          a: t(
            'Sí. Cada instancia la administra una sola persona (quien la instala). Esa persona crea los grupos que quiera: a cada uno le pone nombre, moneda, símbolo, bono de bienvenida y límite de crédito, y los administra todos.',
            'Yes. The platform is meant to host many systems. Anyone can create one: give it a name, a currency, a symbol, a welcome bonus and a credit limit, and become its administrator.',
            'Oui. La plateforme est conçue pour héberger de nombreux systèmes. N’importe qui peut en créer un : il lui donne un nom, une monnaie, un symbole, un bonus de bienvenue et une limite de crédit, et en devient l’administrateur.',
            'Sim. A plataforma foi pensada para alojar muitos sistemas. Qualquer pessoa pode criar um: dá-lhe nome, moeda, símbolo, bónus de boas-vindas e limite de crédito, e fica como seu administrador.'
          ),
        },
        {
          q: t('¿Qué es el contrato digital?', 'What is the digital contract?', 'Qu’est-ce que le contrat numérique ?', 'O que é o contrato digital?'),
          a: t(
            'Al apuntarte firmas electrónicamente las condiciones del sistema: aceptas su moneda, su límite de crédito, la publicación de tu nombre y teléfono entre los socios y las reglas de convivencia. Queda registrado con la fecha y una huella digital (SHA-256) del texto firmado, para que la firma sea verificable.',
            'On joining you electronically sign the system terms: you accept its currency, its credit limit, the publication of your name and phone among members, and the rules of coexistence. It is recorded with the date and a digital fingerprint (SHA-256) of the signed text, so the signature is verifiable.',
            'À l’inscription, vous signez électroniquement les conditions du système : vous acceptez sa monnaie, sa limite de crédit, la publication de votre nom et de votre téléphone parmi les membres et les règles de convivialité. Cela est enregistré avec la date et une empreinte numérique (SHA-256) du texte signé, afin que la signature soit vérifiable.',
            'Ao inscrever-se assina eletronicamente as condições do sistema: aceita a sua moeda, o seu limite de crédito, a publicação do seu nome e telefone entre os sócios e as regras de convivência. Fica registado com a data e uma impressão digital (SHA-256) do texto assinado, para que a assinatura seja verificável.'
          ),
        },
      ],
    },
    signup: {
      title: t('Apuntarse', 'Join', 'S’inscrire', 'Inscrever-se'),
      intro: t(
        'Rellena tus datos, acepta las condiciones y firma el contrato digital. Tu cuenta se abrirá con el bono de bienvenida.',
        'Fill in your details, accept the terms and sign the digital contract. Your account will open with the welcome bonus.',
        'Remplissez vos données, acceptez les conditions et signez le contrat numérique. Votre compte s’ouvrira avec le bonus de bienvenue.',
        'Preencha os seus dados, aceite as condições e assine o contrato digital. A sua conta abrirá com o bónus de boas-vindas.'
      ),
      name: t('Nombre y apellidos', 'Full name', 'Nom et prénom', 'Nome e apelidos'),
      email: t('Correo electrónico', 'Email', 'Courriel', 'Correio eletrónico'),
      phone: t('Teléfono', 'Phone', 'Téléphone', 'Telefone'),
      password: t('Contraseña', 'Password', 'Mot de passe', 'Palavra-passe'),
      location: t('Ubicación', 'Location', 'Emplacement', 'Localização'),
      farWarn: t(
        'Si este sistema no está cerca de ti, quizá prefieras buscar uno en tu zona — o crear uno nuevo. Aun así puedes apuntarte si quieres.',
        'If this system is not near you, you may prefer to find one in your area — or create a new one. You can still join if you like.',
        'Si ce système n’est pas près de chez vous, vous préférerez peut-être en chercher un dans votre région — ou en créer un. Vous pouvez tout de même vous inscrire.',
        'Se este sistema não estiver perto de si, talvez prefira procurar um na sua zona — ou criar um novo. Pode inscrever-se na mesma.'
      ),
      system: t('Sistema', 'System', 'Système', 'Sistema'),
      contractTitle: t('Contrato y condiciones', 'Contract and terms', 'Contrat et conditions', 'Contrato e condições'),
      accept: t(
        'He leído y acepto las condiciones y firmo el contrato digital.',
        'I have read and accept the terms and I sign the digital contract.',
        'J’ai lu et j’accepte les conditions et je signe le contrat numérique.',
        'Li e aceito as condições e assino o contrato digital.'
      ),
      submit: t('Firmar y crear mi cuenta', 'Sign and create my account', 'Signer et créer mon compte', 'Assinar e criar a minha conta'),
      success: t('¡Bienvenido! Tu cuenta está creada y el contrato firmado.', 'Welcome! Your account is created and the contract signed.', 'Bienvenue ! Votre compte est créé et le contrat signé.', 'Bem-vindo! A sua conta está criada e o contrato assinado.'),
    },
    login: {
      title: t('Entrar', 'Log in', 'Connexion', 'Entrar'),
      email: t('Correo electrónico', 'Email', 'Courriel', 'Correio eletrónico'),
      password: t('Contraseña', 'Password', 'Mot de passe', 'Palavra-passe'),
      submit: t('Entrar', 'Log in', 'Se connecter', 'Entrar'),
      noAccount: t('¿No tienes cuenta?', 'No account yet?', 'Pas encore de compte ?', 'Ainda não tem conta?'),
    },
    contract: {
      title: t('Contrato digital del sistema', 'System digital contract', 'Contrat numérique du système', 'Contrato digital do sistema'),
      intro: t(
        'Estas son las condiciones que aceptas al apuntarte. Al firmarlas se guarda la fecha y una huella digital del texto.',
        'These are the terms you accept when you join. On signing, the date and a digital fingerprint of the text are stored.',
        'Voici les conditions que vous acceptez à l’inscription. Lors de la signature, la date et une empreinte numérique du texte sont conservées.',
        'Estas são as condições que aceita ao inscrever-se. Ao assiná-las guarda-se a data e uma impressão digital do texto.'
      ),
      accept: t('Firmo este contrato.', 'I sign this contract.', 'Je signe ce contrat.', 'Assino este contrato.'),
      sign: t('Firmar contrato', 'Sign contract', 'Signer le contrat', 'Assinar contrato'),
      signed: t('Contrato firmado', 'Contract signed', 'Contrat signé', 'Contrato assinado'),
      hashLabel: t('Huella SHA-256', 'SHA-256 fingerprint', 'Empreinte SHA-256', 'Impressão SHA-256'),
      dateLabel: t('Fecha', 'Date', 'Date', 'Data'),
    },
    terms: [
      t(
        '1. Membresía. La pertenencia al sistema es gratuita. No se paga en euros; los intercambios se liquidan en la moneda propia del sistema.',
        '1. Membership. Belonging to the system is free. You do not pay in euros; exchanges are settled in the system currency.',
        '1. Adhésion. L’appartenance au système est gratuite. On ne paie pas en euros ; les échanges sont réglés dans la monnaie propre du système.',
        '1. Adesão. A pertença ao sistema é gratuita. Não se paga em euros; as trocas são liquidadas na moeda própria do sistema.'
      ),
      t(
        '2. Moneda. Cada sistema tiene su propia moneda, con su nombre y su símbolo. No es dinero de curso legal y solo circula entre los socios de este sistema.',
        '2. Currency. Each system has its own currency, with its name and symbol. It is not legal tender and circulates only among the members of this system.',
        '2. Monnaie. Chaque système a sa propre monnaie, avec son nom et son symbole. Ce n’est pas de la monnaie légale et elle ne circule qu’entre les membres de ce système.',
        '2. Moeda. Cada sistema tem a sua própria moeda, com o seu nome e o seu símbolo. Não é dinheiro de curso legal e só circula entre os sócios deste sistema.'
      ),
      t(
        '3. Bono de bienvenida y límite de crédito. Al entrar recibes un bono de bienvenida en tu cuenta. Puedes gastar por encima de tu saldo hasta el límite de crédito del sistema. Un saldo negativo es un servicio comprometido con la comunidad, no una deuda en euros.',
        '3. Welcome bonus and credit limit. On entry you receive a welcome bonus in your account. You may spend above your balance up to the system credit limit. A negative balance is a service owed to the community, not a debt in euros.',
        '3. Bonus de bienvenue et limite de crédit. À l’entrée, vous recevez un bonus de bienvenue sur votre compte. Vous pouvez dépenser au-delà de votre solde jusqu’à la limite de crédit du système. Un solde négatif est un service dû à la communauté, non une dette en euros.',
        '3. Bónus de boas-vindas e limite de crédito. Ao entrar recebe um bónus de boas-vindas na sua conta. Pode gastar acima do seu saldo até ao limite de crédito do sistema. Um saldo negativo é um serviço devido à comunidade, não uma dívida em euros.'
      ),
      t(
        '4. Precios. El valor de cada intercambio lo acuerdan libremente las dos partes. Nadie está obligado a aceptar un intercambio.',
        '4. Prices. The value of each exchange is freely agreed by both parties. Nobody is obliged to accept an exchange.',
        '4. Prix. La valeur de chaque échange est librement convenue par les deux parties. Personne n’est obligé d’accepter un échange.',
        '4. Preços. O valor de cada troca é acordado livremente pelas duas partes. Ninguém é obrigado a aceitar uma troca.'
      ),
      t(
        '5. Saldos públicos. Tu nombre y tu saldo serán visibles para los demás socios del sistema. Tu teléfono se comparte solo dentro del grupo.',
        '5. Public balances. Your name and balance will be visible to the other members of the system. Your phone is shared only within the group.',
        '5. Soldes publics. Votre nom et votre solde seront visibles par les autres membres du système. Votre téléphone n’est partagé qu’au sein du groupe.',
        '5. Saldos públicos. O seu nome e o seu saldo serão visíveis para os outros sócios do sistema. O seu telefone é partilhado apenas dentro do grupo.'
      ),
      t(
        '6. Administración. El sistema tiene un administrador, que gestiona las altas e incidencias y cobra su trabajo en puntos del propio sistema.',
        '6. Administration. The system has an administrator, who handles sign-ups and incidents and is paid for their work in points of the system itself.',
        '6. Administration. Le système a un administrateur, qui gère les inscriptions et les incidents et est rémunéré pour son travail en points du système lui-même.',
        '6. Administração. O sistema tem um administrador, que gere as inscrições e incidências e é pago pelo seu trabalho em pontos do próprio sistema.'
      ),
      t(
        '7. Impuestos. Si una autoridad desea cobrar impuestos, podrá hacerlo; y tendrá que cobrarlos en la moneda del sistema, que al no ser de curso legal multiplica la riqueza comunitaria en lugar de detraerla.',
        '7. Taxes. If an authority wishes to collect taxes, it may do so; and it will have to collect them in the system currency, which, not being legal tender, multiplies community wealth instead of draining it.',
        '7. Impôts. Si une autorité souhaite percevoir des impôts, elle pourra le faire ; et elle devra les percevoir dans la monnaie du système, qui, n’ayant pas cours légal, multiplie la richesse communautaire au lieu de la prélever.',
        '7. Impostos. Se uma autoridade quiser cobrar impostos, poderá fazê-lo; e terá de os cobrar na moeda do sistema, que, não sendo de curso legal, multiplica a riqueza comunitária em vez de a retirar.'
      ),
      t(
        '8. Baja. Si te vas, tu saldo queda en tu cuenta, que pasa a inactiva. Podrás gastarlo hasta agotarlo o pedir su traspaso a otro socio.',
        '8. Leaving. If you leave, your balance stays in your account, which becomes inactive. You may spend it down or ask for it to be transferred to another member.',
        '8. Départ. Si vous partez, votre solde reste sur votre compte, qui devient inactif. Vous pourrez le dépenser jusqu’à épuisement ou demander son transfert à un autre membre.',
        '8. Saída. Se sair, o seu saldo fica na sua conta, que passa a inativa. Poderá gastá-lo até o esgotar ou pedir a sua transferência para outro sócio.'
      ),
      t(
        '9. Buena fe. Todo se basa en la confianza y la responsabilidad moral propias de un sistema local donde los socios se conocen.',
        '9. Good faith. Everything rests on the trust and moral responsibility proper to a local system where members know each other.',
        '9. Bonne foi. Tout repose sur la confiance et la responsabilité morale propres à un système local où les membres se connaissent.',
        '9. Boa fé. Tudo assenta na confiança e na responsabilidade moral próprias de um sistema local onde os sócios se conhecem.'
      ),
      t(
        '10. Firma. Al aceptar, firmas electrónicamente este contrato. Se registran la fecha y una huella SHA-256 del texto firmado.',
        '10. Signature. By accepting, you electronically sign this contract. The date and a SHA-256 fingerprint of the signed text are recorded.',
        '10. Signature. En acceptant, vous signez électroniquement ce contrat. La date et une empreinte SHA-256 du texte signé sont enregistrées.',
        '10. Assinatura. Ao aceitar, assina eletronicamente este contrato. Registam-se a data e uma impressão SHA-256 do texto assinado.'
      ),
    ],
    dashboard: {
      title: t('Mi cuenta', 'My account', 'Mon compte', 'A minha conta'),
      balance: t('Saldo', 'Balance', 'Solde', 'Saldo'),
      points: t('Puntos (admin)', 'Points (admin)', 'Points (admin)', 'Pontos (admin)'),
      system: t('Sistema', 'System', 'Système', 'Sistema'),
      contractOk: t('Contrato firmado el', 'Contract signed on', 'Contrat signé le', 'Contrato assinado em'),
      members: t('Socios y saldos (público para socios)', 'Members and balances (public to members)', 'Membres et soldes (public pour les membres)', 'Sócios e saldos (público para sócios)'),
      offers: t('Catálogo de ofertas y necesidades', 'Catalogue of offers and needs', 'Catalogue d’offres et de besoins', 'Catálogo de ofertas e necessidades'),
      newOffer: t('Publicar', 'Post', 'Publier', 'Publicar'),
      offerText: t('Qué ofreces o qué necesitas', 'What you offer or need', 'Ce que vous offrez ou dont vous avez besoin', 'O que oferece ou de que precisa'),
      typeOffer: t('Ofrezco', 'Offer', 'J’offre', 'Ofereço'),
      typeNeed: t('Necesito', 'Need', 'Je cherche', 'Preciso'),
      transfer: t('Pagar a un socio', 'Pay a member', 'Payer un membre', 'Pagar a um sócio'),
      transferTo: t('Pagar a', 'Pay to', 'Payer à', 'Pagar a'),
      transferAmount: t('Cantidad', 'Amount', 'Montant', 'Montante'),
      transferConcept: t('Concepto', 'Concept', 'Motif', 'Conceito'),
      transferSubmit: t('Pagar', 'Pay', 'Payer', 'Pagar'),
      history: t('Mis movimientos', 'My movements', 'Mes mouvements', 'Os meus movimentos'),
      noOffers: t('Todavía no hay ofertas.', 'No offers yet.', 'Pas encore d’offres.', 'Ainda não há ofertas.'),
      helpTitle: t('Un aviso del sistema', 'A notice from the system', 'Un avis du système', 'Um aviso do sistema'),
      helpBody: t(
        'Has llegado al límite de deuda del sistema. No es un castigo: es la señal para que te echemos una mano. Puedes seguir participando y la administración te contactará para ayudarte a salir del saldo negativo —por ejemplo, publicando lo que sabes hacer o acordando un plan de devolución en servicios.',
        'You have reached the system debt limit. This is not a punishment: it is the signal for us to lend you a hand. You can keep taking part and the administration will contact you to help you get back out of the negative balance — for instance, by posting what you can do or agreeing a plan to give back in services.',
        'Vous avez atteint la limite de dette du système. Ce n’est pas une punition : c’est le signal pour que nous vous donnions un coup de main. Vous pouvez continuer à participer et l’administration vous contactera pour vous aider à sortir du solde négatif — par exemple, en publiant ce que vous savez faire ou en convenant d’un plan de remboursement en services.',
        'Chegou ao limite de dívida do sistema. Não é um castigo: é o sinal para lhe darmos uma mão. Pode continuar a participar e a administração contactá-lo-á para o ajudar a sair do saldo negativo — por exemplo, publicando o que sabe fazer ou acordando um plano de devolução em serviços.'
      ),
      helpOk: t('He leído el aviso, gracias.', 'I have read the notice, thanks.', 'J’ai lu l’avis, merci.', 'Li o aviso, obrigado.'),
      fedPay: t(
        'También puedes pagar a socios de grupos integrados: se les abona en su moneda según el cambio acordado.',
        'You can also pay members of integrated groups: they are credited in their currency at the agreed rate.',
        'Vous pouvez aussi payer des membres de groupes intégrés : ils sont crédités dans leur monnaie selon le taux convenu.',
        'Também pode pagar a sócios de grupos integrados: são creditados na sua moeda segundo o câmbio acordado.'
      ),
      fedOffers: t('Ofertas y demandas de grupos integrados', 'Offers and needs from integrated groups', 'Offres et demandes de groupes intégrés', 'Ofertas e pedidos de grupos integrados'),
      noPeerOffers: t('Los grupos integrados no han publicado ofertas.', 'Integrated groups have not posted any offers.', 'Les groupes intégrés n’ont pas publié d’offres.', 'Os grupos integrados não publicaram ofertas.'),
      payTitle: t('Pago interno', 'Internal payment', 'Paiement interne', 'Pagamento interno'),
      donate: t('Donar saldo', 'Donate balance', 'Donner du solde', 'Doar saldo'),
      donateIntro: t(
        'Traspasa saldo a otro socio sin necesidad de un servicio a cambio: una donación.',
        'Transfer balance to another member without any service in return: a donation.',
        'Transférez du solde à un autre membre sans service en retour : un don.',
        'Transfira saldo para outro sócio sem necessidade de um serviço em troca: uma doação.'
      ),
      donateTo: t('Donar a', 'Donate to', 'Donner à', 'Doar a'),
      donateSubmit: t('Donar', 'Donate', 'Donner', 'Doar'),
      donateNote: t('Motivo (opcional)', 'Reason (optional)', 'Motif (facultatif)', 'Motivo (opcional)'),
      donationsTitle: t('Donaciones', 'Donations', 'Dons', 'Doações'),
    },
    admin: {
      title: t('Administración del sistema', 'System administration', 'Administration du système', 'Administração do sistema'),
      feeNote: t(
        'Cobras por tu trabajo en puntos del propio sistema, no en euros.',
        'You are paid for your work in points of the system itself, not in euros.',
        'Vous êtes rémunéré pour votre travail en points du système lui-même, pas en euros.',
        'É pago pelo seu trabalho em pontos do próprio sistema, não em euros.'
      ),
      myPoints: t('Mis puntos', 'My points', 'Mes points', 'Os meus pontos'),
      settings: t('Ajustes del sistema', 'System settings', 'Réglages du système', 'Definições do sistema'),
      feeLabel: t('Puntos por transacción (tu cobro)', 'Points per transaction (your fee)', 'Points par transaction (votre rémunération)', 'Pontos por transação (o seu pagamento)'),
      welcomeLabel: t('Bono de bienvenida', 'Welcome bonus', 'Bonus de bienvenue', 'Bónus de boas-vindas'),
      limitLabel: t('Límite de crédito', 'Credit limit', 'Limite de crédit', 'Limite de crédito'),
      currencyLabel: t('Nombre de la moneda', 'Currency name', 'Nom de la monnaie', 'Nome da moeda'),
      symbolLabel: t('Símbolo', 'Symbol', 'Symbole', 'Símbolo'),
      emojiLabel: t('Emoji de la moneda', 'Currency emoji', 'Émoji de la monnaie', 'Emoji da moeda'),
      imageLabel: t('Imagen de la moneda (URL)', 'Currency image (URL)', 'Image de la monnaie (URL)', 'Imagem da moeda (URL)'),
      currencyPreview: t('Así se verá', 'It will look like this', 'Voici à quoi cela ressemblera', 'Assim aparecerá'),
      save: t('Guardar', 'Save', 'Enregistrer', 'Guardar'),
      alertsTitle: t('Avisos de límite de deuda', 'Debt-limit notices', 'Avis de limite de dette', 'Avisos de limite de dívida'),
      alertsIntro: t(
        'Socios que han alcanzado el límite de deuda. Conviene contactarles y ofrecerles ayuda para que vuelvan a saldo positivo.',
        'Members who have reached the debt limit. You should contact them and offer help so they get back to a positive balance.',
        'Membres ayant atteint la limite de dette. Il convient de les contacter et de leur proposer de l’aide pour qu’ils reviennent à un solde positif.',
        'Sócios que atingiram o limite de dívida. Convém contactá-los e oferecer-lhes ajuda para que voltem a saldo positivo.'
      ),
      noAlerts: t('No hay avisos abiertos.', 'No open notices.', 'Aucun avis ouvert.', 'Não há avisos abertos.'),
      debtLabel: t('Deuda', 'Debt', 'Dette', 'Dívida'),
      membersTable: t('Socios', 'Members', 'Membres', 'Sócios'),
      fedTitle: t('Grupos integrados (federación)', 'Integrated groups (federation)', 'Groupes intégrés (fédération)', 'Grupos integrados (federação)'),
      fedIntro: t(
        'Integra tu sistema con otros sin perder identidad: cada grupo conserva su nombre y su moneda. Puedes aceptar la moneda del otro grupo (con el cambio que acordéis) y ver sus ofertas y demandas si lo deseas.',
        'Integrate your system with others without losing identity: each group keeps its name and currency. You can accept the other group currency (at the rate you agree) and see their offers and needs if you wish.',
        'Intégrez votre système à d’autres sans perdre son identité : chaque groupe conserve son nom et sa monnaie. Vous pouvez accepter la monnaie de l’autre groupe (au taux que vous convenez) et voir ses offres et demandes si vous le souhaitez.',
        'Integre o seu sistema com outros sem perder identidade: cada grupo conserva o seu nome e a sua moeda. Pode aceitar a moeda do outro grupo (com o câmbio que acordarem) e ver as suas ofertas e pedidos se quiser.'
      ),
      fedPeer: t('Grupo (nombre o dirección)', 'Group (name or address)', 'Groupe (nom ou adresse)', 'Grupo (nome ou endereço)'),
      fedRate: t('Cambio (1 unidad tuya = X del otro grupo)', 'Rate (1 of your unit = X of the other group)', 'Taux (1 unité de chez vous = X de l’autre groupe)', 'Câmbio (1 unidade sua = X do outro grupo)'),
      fedAcceptCur: t('Aceptar la moneda del otro grupo', 'Accept the other group currency', 'Accepter la monnaie de l’autre groupe', 'Aceitar a moeda do outro grupo'),
      fedSeeOffers: t('Ver sus ofertas y demandas', 'See their offers and needs', 'Voir ses offres et demandes', 'Ver as suas ofertas e pedidos'),
      fedPropose: t('Proponer integración', 'Propose integration', 'Proposer une intégration', 'Propor integração'),
      fedAccept: t('Aceptar', 'Accept', 'Accepter', 'Aceitar'),
      fedUpdate: t('Guardar ajustes', 'Save settings', 'Enregistrer les réglages', 'Guardar definições'),
      fedRevoke: t('Deshacer', 'Undo', 'Annuler', 'Desfazer'),
      fedPending: t('Pendiente de aceptar', 'Pending acceptance', 'En attente d’acceptation', 'Pendente de aceitação'),
      fedAccepted: t('Integrada', 'Integrated', 'Intégré', 'Integrada'),
      fedCurrency: t('Moneda', 'Currency', 'Monnaie', 'Moeda'),
      fedOffersCol: t('Ofertas', 'Offers', 'Offres', 'Ofertas'),
      fedActions: t('Acciones', 'Actions', 'Actions', 'Ações'),
      fedYes: t('Sí', 'Yes', 'Oui', 'Sim'),
      fedNo: t('No', 'No', 'Non', 'Não'),
      fedEmpty: t('Todavía no hay grupos integrados.', 'No integrated groups yet.', 'Pas encore de groupes intégrés.', 'Ainda não há grupos integrados.'),
      splitTitle: t('Dividir el grupo por cercanía', 'Split the group by proximity', 'Diviser le groupe par proximité', 'Dividir o grupo por proximidade'),
      splitIntro: t(
        'Cuando el grupo crece, la cercanía es lo que más importa. Crea un grupo nuevo basado en el código postal: los socios de ese código postal pasan al grupo nuevo, que nace con su propia identidad y queda integrado con el original. Así el grupo grande se divide sin perder el contacto.',
        'When the group grows, proximity matters most. Create a new group based on the postcode: members with that postcode move to the new group, which starts with its own identity and stays integrated with the original. That way a big group splits without losing touch.',
        'Quand le groupe grandit, la proximité est ce qui compte le plus. Créez un nouveau groupe basé sur le code postal : les membres de ce code postal passent au nouveau groupe, qui naît avec sa propre identité et reste intégré à l’original. Ainsi le grand groupe se divise sans perdre le contact.',
        'Quando o grupo cresce, a proximidade é o que mais importa. Crie um grupo novo baseado no código postal: os sócios desse código postal passam para o grupo novo, que nasce com a sua própria identidade e fica integrado com o original. Assim o grupo grande divide-se sem perder o contacto.'
      ),
      splitThresholdLabel: t('Avisar al pasar de (nº de socios)', 'Warn above (number of members)', 'Avertir au-delà de (nombre de membres)', 'Avisar ao passar de (nº de sócios)'),
      splitPostcode: t('Código postal del grupo nuevo', 'Postcode of the new group', 'Code postal du nouveau groupe', 'Código postal do grupo novo'),
      splitCity: t('Ciudad', 'City', 'Ville', 'Cidade'),
      splitCountry: t('País', 'Country', 'Pays', 'País'),
      splitName: t('Nombre del grupo nuevo (opcional)', 'Name of the new group (optional)', 'Nom du nouveau groupe (facultatif)', 'Nome do grupo novo (opcional)'),
      splitSubmit: t('Crear grupo nuevo', 'Create new group', 'Créer un nouveau groupe', 'Criar grupo novo'),
      splitWarnLabel: t('El grupo ha pasado el umbral', 'The group has passed the threshold', 'Le groupe a dépassé le seuil', 'O grupo passou o limiar'),
      splitSugerir: t('Conviene dividirlo por código postal.', 'It is worth splitting it by postcode.', 'Il convient de le diviser par code postal.', 'Convém dividi-lo por código postal.'),
      locationTitle: t('Ubicación del grupo', 'Group location', 'Localisation du groupe', 'Localização do grupo'),
      cityLabel: t('Ciudad', 'City', 'Ville', 'Cidade'),
      countryLabel: t('País', 'Country', 'Pays', 'País'),
      postcodeLabel: t('Código postal', 'Postcode', 'Code postal', 'Código postal'),
      membersCity: t('Socios por código postal', 'Members by postcode', 'Membres par code postal', 'Sócios por código postal'),
      membersCityIntro: t(
        'Cada socio declara su ciudad y su código postal al apuntarse. Así se ven los grupos naturales por cercanía y se puede dividir el sistema cuando crece.',
        'Each member states their city and postcode on joining. That way natural groups by proximity become visible and the system can be split as it grows.',
        'Chaque membre déclare sa ville et son code postal à l’inscription. Ainsi apparaissent les groupes naturels par proximité et le système peut être divisé lorsqu’il grandit.',
        'Cada sócio declara a sua cidade e o seu código postal ao inscrever-se. Assim veem-se os grupos naturais por proximidade e pode dividir-se o sistema quando cresce.'
      ),
      postcodeCol: t('CP', 'Postcode', 'CP', 'CP'),
      cityCol: t('Ciudad', 'City', 'Ville', 'Cidade'),
    },
    groupsLanding: {
      h1: t('Elige tu grupo', 'Choose your group', 'Choisissez votre groupe', 'Escolha o seu grupo'),
      lead: t(
        'Esta comunidad tiene varios grupos, cada uno con su moneda. Entra en el tuyo.',
        'This community has several groups, each with its own currency. Enter yours.',
        'Cette communauté a plusieurs groupes, chacun avec sa monnaie. Entrez dans le vôtre.',
        'Esta comunidade tem vários grupos, cada um com a sua moeda. Entre no seu.'
      ),
      createHint: t(
        'Para crear otro grupo necesitas entrar como administración.',
        'To create another group you need to sign in as the administrator.',
        "Pour créer un autre groupe, connectez-vous en tant qu'administrateur.",
        'Para criar outro grupo, entre como administrador.'
      ),
    },
    systems: {
      title: t('Sistemas', 'Systems', 'Systèmes', 'Sistemas'),
      intro: t(
        'Cada sistema es una comunidad con su propia moneda. Échales un vistazo y apúntate al que quieras.',
        'Each system is a community with its own currency. Take a look and join whichever you like.',
        'Chaque système est une communauté avec sa propre monnaie. Jetez-y un œil et inscrivez-vous à celui que vous voulez.',
        'Cada sistema é uma comunidade com a sua própria moeda. Dê-lhes uma olhada e inscreva-se no que quiser.'
      ),
      noResults: t(
        'No hay ningún sistema en esa zona todavía. Puedes crear uno.',
        'There is no system in that area yet. You can create one.',
        'Aucun système dans cette zone pour l’instant. Vous pouvez en créer un.',
        'Ainda não há nenhum sistema nessa zona. Pode criar um.'
      ),
      create: t('Crear un grupo', 'Create a group', 'Créer un groupe', 'Criar um grupo'),
      name: t('Nombre del sistema', 'System name', 'Nom du système', 'Nome do sistema'),
      currency: t('Nombre de la moneda (p. ej. Puntos)', 'Currency name (e.g. Points)', 'Nom de la monnaie (p. ex. Points)', 'Nome da moeda (p. ex. Pontos)'),
      symbol: t('Símbolo (p. ej. ✦)', 'Symbol (e.g. ✦)', 'Symbole (p. ex. ✦)', 'Símbolo (p. ex. ✦)'),
      emoji: t('Emoji de la moneda (opcional)', 'Currency emoji (optional)', 'Émoji de la monnaie (facultatif)', 'Emoji da moeda (opcional)'),
      image: t('Imagen de la moneda (URL, opcional)', 'Currency image (URL, optional)', 'Image de la monnaie (URL, facultatif)', 'Imagem da moeda (URL, opcional)'),
      city: t('Ciudad', 'City', 'Ville', 'Cidade'),
      country: t('País', 'Country', 'Pays', 'País'),
      postcode: t('Código postal', 'Postcode', 'Code postal', 'Código postal'),
      locale: t('Lugar (opcional)', 'Place (optional)', 'Lieu (facultatif)', 'Lugar (opcional)'),
      welcome: t('Bono de bienvenida', 'Welcome bonus', 'Bonus de bienvenue', 'Bónus de boas-vindas'),
      limit: t('Límite de crédito', 'Credit limit', 'Limite de crédit', 'Limite de crédito'),
      adminEmail: t('Tu correo (serás el administrador)', 'Your email (you will be the administrator)', 'Votre courriel (vous serez l’administrateur)', 'O seu correio (será o administrador)'),
      adminName: t('Tu nombre', 'Your name', 'Votre nom', 'O seu nome'),
      adminPass: t('Contraseña (mínimo 6)', 'Password (min 6)', 'Mot de passe (6 minimum)', 'Palavra-passe (mínimo 6)'),
      preview: t('La moneda se verá en todos los listados con su emoji o imagen.', 'The currency will show in every list with its emoji or image.', 'La monnaie apparaîtra dans toutes les listes avec son émoji ou son image.', 'A moeda aparecerá em todas as listagens com o seu emoji ou imagem.'),
      submit: t('Crear sistema', 'Create system', 'Créer le système', 'Criar sistema'),
      closedTitle: t('Solo el administrador', 'Administrator only', 'Administrateur uniquement', 'Só o administrador'),
      closedText: t(
        'Cada instancia tiene un solo administrador: la persona que la instaló. Es quien crea los grupos y quien los administra todos. Si quieres un grupo, pídeselo.',
        'Each instance has a single administrator: the person who installed it. They create the groups and administer all of them. If you want a group, ask them.',
        'Chaque instance a un seul administrateur : la personne qui l’a installée. C’est elle qui crée les groupes et qui les administre tous. Si vous voulez un groupe, demandez-lui.',
        'Cada instância tem um só administrador: a pessoa que a instalou. É quem cria os grupos e quem os administra todos. Se quiseres um grupo, pede-lhe.'
      ),
      join: t('Apuntarme', 'Join', 'Rejoindre', 'Inscrever-me'),
      open: t('Abrir', 'Open', 'Ouvrir', 'Abrir'),
      adminOf: t('Administras este sistema', 'You administer this system', 'Vous administrez ce système', 'Administra este sistema'),
      parent: t('Dentro de', 'Within', 'Au sein de', 'Dentro de'),
      children: t('Grupos', 'Groups', 'Groupes', 'Grupos'),
      derived: t('Grupo', 'Group', 'Groupe', 'Grupo'),
      fedNote: t(
        'Cada grupo aparece con su nombre y su moneda: se integran solo si los dos administradores lo aceptan.',
        'Integrated groups appear below, each with its own name and currency.',
        'Les groupes intégrés apparaissent ci-dessous, chacun avec son nom et sa monnaie.',
        'Os grupos integrados aparecem abaixo, cada um com o seu nome e a sua moeda.'
      ),
      federated: t('Grupos federados', 'Federated groups', 'Groupes fédérés', 'Grupos federados'),
      fedGroup: t('Grupo', 'Group', 'Groupe', 'Grupo'),
      fedCurrency: t('Moneda', 'Currency', 'Monnaie', 'Moeda'),
      fedRate: t('Cambio', 'Rate', 'Taux', 'Câmbio'),
    },
    common: {
      members: t('socios', 'members', 'membres', 'sócios'),
      balance: t('Saldo', 'Balance', 'Solde', 'Saldo'),
      points: t('Puntos', 'Points', 'Points', 'Pontos'),
      adminTag: t('admin', 'admin', 'admin', 'admin'),
      noAccess: t('No tienes acceso a esta página.', 'You do not have access to this page.', 'Vous n’avez pas accès à cette page.', 'Não tem acesso a esta página.'),
      notFound: t('Página no encontrada.', 'Page not found.', 'Page introuvable.', 'Página não encontrada.'),
      noAccessClosed: t('Solo el administrador de esta instancia puede crear sistemas.', 'Only the administrator of this instance can create systems.', 'Seul l’administrateur de cette instance peut créer des systèmes.', 'Só o administrador desta instância pode criar sistemas.'),
      error: t('Revisa los datos.', 'Check the details.', 'Vérifiez les données.', 'Verifique os dados.'),
      createdAt: t('Alta', 'Joined', 'Inscription', 'Inscrição'),
      amount: t('Cantidad', 'Amount', 'Montant', 'Montante'),
      concept: t('Concepto', 'Concept', 'Motif', 'Conceito'),
      date: t('Fecha', 'Date', 'Date', 'Data'),
      from: t('De', 'From', 'De', 'De'),
      to: t('A', 'To', 'À', 'Para'),
      user: t('Socio', 'Member', 'Membre', 'Sócio'),
    },
    demo: {
      title: t('Pruébalo', 'Try it', 'Essayez-le', 'Experimente'),
      intro: t(
        'Esta es una demostración funcional que corre entera en tu navegador: puedes crear un sistema, apuntarte firmando el contrato, recibir las 10 unidades de bienvenida, pagar a otros socios, tocar el límite de deuda y ver el panel de administración. No se envía nada a ningún servidor.',
        'This is a working demo that runs entirely in your browser: you can create a system, join by signing the contract, receive the 10 welcome units, pay other members, hit the debt limit and see the admin panel. Nothing is sent to any server.',
        'Ceci est une démonstration fonctionnelle qui tourne entièrement dans votre navigateur : vous pouvez créer un système, vous inscrire en signant le contrat, recevoir les 10 unités de bienvenue, payer d’autres membres, atteindre la limite de dette et voir le panneau d’administration. Rien n’est envoyé à un serveur.',
        'Esta é uma demonstração funcional que corre inteiramente no seu navegador: pode criar um sistema, inscrever-se assinando o contrato, receber as 10 unidades de boas-vindas, pagar a outros sócios, tocar no limite de dívida e ver o painel de administração. Nada é enviado para nenhum servidor.'
      ),
      note: t('Demo local: los datos se guardan solo en tu navegador. Se puede borrar cuando quieras.', 'Local demo: the data is saved only in your browser. You can wipe it whenever you want.', 'Démo locale : les données ne sont enregistrées que dans votre navigateur. Vous pouvez les effacer quand vous voulez.', 'Demo local: os dados são guardados apenas no seu navegador. Pode apagá-los quando quiser.'),
      reset: t('Borrar y empezar de cero', 'Wipe and start over', 'Effacer et repartir de zéro', 'Apagar e começar de novo'),
      pick: t('Elige un sistema', 'Pick a system', 'Choisissez un système', 'Escolha um sistema'),
      open: t('Abrir', 'Open', 'Ouvrir', 'Abrir'),
      youAre: t('Estás como', 'You are', 'Vous êtes', 'Está como'),
      member: t('socio', 'member', 'membre', 'sócio'),
      payOk: t('Pago registrado.', 'Payment recorded.', 'Paiement enregistré.', 'Pagamento registado.'),
      overLimit: t('Supera el límite de crédito del sistema.', 'This exceeds the system credit limit.', 'Cela dépasse la limite de crédit du système.', 'Ultrapassa o limite de crédito do sistema.'),
      needJoin: t('Primero apúntate a un sistema.', 'Join a system first.', 'Inscrivez-vous d’abord à un système.', 'Primeiro inscreva-se num sistema.'),
      limitReached: t('Has llegado al límite de deuda', 'You have reached the debt limit', 'Vous avez atteint la limite de dette', 'Chegou ao limite de dívida'),
      alreadyIn: t('Ese correo ya está apuntado.', 'That email is already registered.', 'Ce courriel est déjà inscrit.', 'Esse correio já está inscrito.'),
      created: t('Sistema creado. Eres su administrador.', 'System created. You are its administrator.', 'Système créé. Vous en êtes l’administrateur.', 'Sistema criado. É o seu administrador.'),
    },
    yellow: {
      title: t('Páginas amarillas', 'Yellow pages', 'Pages jaunes', 'Páginas amarelas'),
      intro: t(
        'El directorio de este sistema: quién ofrece qué y quién necesita qué. Cada grupo tiene sus propias páginas amarillas; si integras tu grupo con otros, verás también las suyas si lo deseas.',
        'This system directory: who offers what and who needs what. Each group has its own yellow pages; if you integrate your group with others, you will also see theirs if you wish.',
        'L’annuaire de ce système : qui offre quoi et qui a besoin de quoi. Chaque groupe a ses propres pages jaunes ; si vous intégrez votre groupe à d’autres, vous verrez aussi les leurs si vous le souhaitez.',
        'O diretório deste sistema: quem oferece o quê e quem precisa de quê. Cada grupo tem as suas próprias páginas amarelas; se integrar o seu grupo com outros, verá também as deles se quiser.'
      ),
      all: t('Todo', 'All', 'Tout', 'Tudo'),
      offersOnly: t('Solo ofertas', 'Offers only', 'Offres uniquement', 'Só ofertas'),
      needsOnly: t('Solo demandas', 'Needs only', 'Demandes uniquement', 'Só pedidos'),
      filter: t('Filtrar', 'Filter', 'Filtrer', 'Filtrar'),
      searchPh: t('Buscar (p. ej. yoga, huerto…)', 'Search (e.g. yoga, orchard…)', 'Rechercher (p. ex. yoga, potager…)', 'Procurar (p. ex. ioga, horta…)'),
      search: t('Buscar', 'Search', 'Rechercher', 'Procurar'),
      type: t('Tipo', 'Type', 'Type', 'Tipo'),
      what: t('Qué se ofrece o se necesita', 'What is offered or needed', 'Ce qui est offert ou demandé', 'O que se oferece ou se precisa'),
      who: t('Quién', 'Who', 'Qui', 'Quem'),
      when: t('Cuándo', 'When', 'Quand', 'Quando'),
      price: t('Precio (lo fija quien lo ofrece; no hay obligación de aceptar)', 'Price (set by the person offering; nobody is obliged to accept)', 'Prix (fixé par celui qui offre ; nul n’est obligé d’accepter)', 'Preço (fixado por quem oferece; não há obrigação de aceitar)'),
      byGroup: t('Grupo', 'Group', 'Groupe', 'Grupo'),
      noResults: t('No hay resultados con ese filtro.', 'No results with that filter.', 'Aucun résultat avec ce filtre.', 'Não há resultados com esse filtro.'),
      total: t('anuncios', 'listings', 'annonces', 'anúncios'),
      fedNote: t('Incluye grupos integrados', 'Includes integrated groups', 'Inclut les groupes intégrés', 'Inclui grupos integrados'),
      ownSystem: t('Este grupo', 'This group', 'Ce groupe', 'Este grupo'),
      filterKind: t('Qué buscas', 'What you want', 'Ce que vous cherchez', 'O que procura'),
      ownIntro: t('Lo que ofrecen y necesitan los socios de este grupo.', "What this group's members offer and need.", 'Ce que les membres de ce groupe offrent et demandent.', 'O que os sócios deste grupo oferecem e precisam.'),
      peerIntro: t('Ofertas y demandas de un grupo integrado (cada uno con su moneda).', 'Offers and needs from an integrated group (each with its own currency).', 'Offres et demandes d’un groupe intégré (chacun avec sa monnaie).', 'Ofertas e pedidos de um grupo integrado (cada um com a sua moeda).'),
      noPeers: t('Este grupo no tiene páginas amarillas de otros grupos integrados.', "This group has no integrated groups' yellow pages.", 'Ce groupe n’a pas de pages jaunes d’autres groupes intégrés.', 'Este grupo não tem páginas amarelas de outros grupos integrados.'),
      freePrice: t('Precio libre: lo fija quien ofrece; no hay obligación de aceptar.', 'Free price: set by the person offering; nobody is obliged to accept.', 'Prix libre : fixé par celui qui offre ; nul n’est obligé d’accepter.', 'Preço livre: fixado por quem oferece; não há obrigação de aceitar.'),
    },
    accounts: {
      title: t('Cuentas del sistema', 'System accounts', 'Comptes du système', 'Contas do sistema'),
      intro: t(
        'Todas las cuentas de este sistema, a la vista de cualquiera. Los saldos son públicos: es la transparencia que sostiene la confianza entre socios.',
        'Every account in this system, visible to anyone. Balances are public: this transparency is what sustains trust between members.',
        'Tous les comptes de ce système, visibles par n’importe qui. Les soldes sont publics : c’est la transparence qui soutient la confiance entre membres.',
        'Todas as contas deste sistema, à vista de qualquer um. Os saldos são públicos: é a transparência que sustenta a confiança entre sócios.'
      ),
      members: t('socios', 'members', 'membres', 'sócios'),
      totalPositive: t('En saldo positivo', 'In positive balance', 'En solde positif', 'Em saldo positivo'),
      totalNegative: t('En saldo negativo', 'In negative balance', 'En solde négatif', 'Em saldo negativo'),
      net: t('Suma total', 'Total', 'Somme totale', 'Soma total'),
      balanceNote: t(
        'En un LETS la suma de todos los saldos es siempre cero: lo que uno debe, otro lo tiene a favor.',
        'In a LETS the sum of all balances is always zero: what one owes, another holds in credit.',
        'Dans un LETS, la somme de tous les soldes est toujours nulle : ce que l’un doit, l’autre l’a en crédit.',
        'Num LETS a soma de todos os saldos é sempre zero: o que um deve, outro tem a favor.'
      ),
      privacyNote: t(
        'Solo se publican nombre, ciudad, saldo y puntos. Nunca el correo ni la contraseña.',
        'Only name, city, balance and points are published. Never the email or the password.',
        'Seuls le nom, la ville, le solde et les points sont publiés. Jamais le courriel ni le mot de passe.',
        'Só se publicam nome, cidade, saldo e pontos. Nunca o correio nem a palavra-passe.'
      ),
    },
    ideas: {
      title: t('Ideas para ofrecer', 'Ideas to offer', 'Des idées à offrir', 'Ideias para oferecer'),
      lead: t(
        '¿Crees que no tienes nada que ofrecer? Casi todo el mundo lo piensa al principio. Esta es una lista hecha a mano, con cosas que la gente ya hace por los demás sin llamarlas intercambio. Léela despacio: casi seguro que haces varias sin darte cuenta.',
        'Do you think you have nothing to offer? Almost everyone thinks that at first. This is a hand-made list of things people already do for others without calling it an exchange. Read it slowly: you almost certainly do several of them without realising.',
        'Vous croyez n’avoir rien à offrir ? Presque tout le monde le pense au début. Voici une liste faite à la main, avec des choses que les gens font déjà pour les autres sans appeler cela un échange. Lisez-la lentement : vous en faites sûrement plusieurs sans vous en rendre compte.',
        'Acha que não tem nada para oferecer? Quase toda a gente pensa isso no início. Esta é uma lista feita à mão, com coisas que as pessoas já fazem pelos outros sem chamar-lhe troca. Leia devagar: de certeza que faz várias sem se dar conta.'
      ),
      outroH: t('¿No ves lo tuyo?', 'Do you not see yours?', 'Vous ne voyez pas la vôtre ?', 'Não vê a sua?'),
      outro: t(
        'No pasa nada: escríbela con tus palabras. Si a ti te sirve, a otro también. Y si al principio no se te ocurre nada, ofrece solo lo que ya sabes hacer: siempre hay alguien que lo necesita.',
        'Never mind: write it in your own words. If it is useful to you, it is useful to someone else. And if nothing comes to mind at first, offer only what you already know how to do: there is always someone who needs it.',
        'Ce n’est rien : écrivez-la avec vos mots. Si elle vous sert, elle sert à un autre. Et si rien ne vous vient au début, offrez seulement ce que vous savez déjà faire : il y a toujours quelqu’un qui en a besoin.',
        'Não faz mal: escreva-a pelas suas palavras. Se lhe serve a si, serve a outro. E se ao princípio não lhe ocorre nada, ofereça apenas o que já sabe fazer: há sempre alguém que precisa.'
      ),
      categories: [
        {
          title: t('Ayuda en casa', 'Help around the house', 'Aide à la maison', 'Ajuda em casa'),
          items: L(
            ['Ayudar en una mudanza', 'Montar o desmontar muebles', 'Pintar una habitación', 'Colgar estanterías, cuadros o cortinas', 'Regar las plantas cuando no estás', 'Cuidar a una mascota unos días', 'Recoger el correo o un paquete', 'Limpiar a fondo una casa'],
            ['Help with a move', 'Assemble or dismantle furniture', 'Paint a room', 'Put up shelves, pictures or curtains', 'Water the plants while you are away', 'Look after a pet for a few days', 'Collect the post or a parcel', 'Deep-clean a house'],
            ['Aider à un déménagement', 'Monter ou démonter des meubles', 'Peindre une pièce', 'Poser des étagères, des tableaux ou des rideaux', 'Arroser les plantes en votre absence', 'Garder un animal quelques jours', 'Relever le courrier ou un colis', 'Nettoyer une maison à fond'],
            ['Ajudar numa mudança', 'Montar ou desmontar móveis', 'Pintar um quarto', 'Pôr prateleiras, quadros ou cortinas', 'Regar as plantas quando não está', 'Cuidar de um animal uns dias', 'Recolher o correio ou uma encomenda', 'Limpar uma casa a fundo']
          ),
        },
        {
          title: t('Comida', 'Food', 'La cuisine', 'Comida'),
          items: L(
            ['Cocinar de más y compartir un guiso', 'Hacer pan o repostería', 'Enseñar a cocinar un plato', 'Ir a la compra por alguien', 'Repartir excedente de la huerta', 'Conservas, mermeladas o encurtidos', 'Ayudar a preparar una comida para mucha gente'],
            ['Cook extra and share a stew', 'Bake bread or cakes', 'Teach someone to cook a dish', 'Do the shopping for someone', 'Share surplus from the garden', 'Jams, preserves or pickles', 'Help cook a meal for many people'],
            ['Cuisiner en trop et partager un plat', 'Faire du pain ou de la pâtisserie', 'Apprendre à cuisiner un plat', 'Faire les courses pour quelqu’un', 'Partager le surplus du potager', 'Confitures, conserves ou pickles', 'Aider à préparer un repas pour beaucoup de monde'],
            ['Cozinhar a mais e partilhar um guisado', 'Fazer pão ou bolos', 'Ensinar a cozinhar um prato', 'Ir às compras por alguém', 'Partilhar excedente da horta', 'Compotas, conservas ou pickles', 'Ajudar a preparar uma refeição para muita gente']
          ),
        },
        {
          title: t('Manos y reparaciones', 'Hands and repairs', 'Les mains et les réparations', 'Mãos e reparações'),
          items: L(
            ['Coser, hacer un dobladillo, poner un botón', 'Arreglar una cremallera', 'Reparar una bici', 'Pequeños arreglos de fontanería', 'Cambiar un enchufe o un interruptor', 'Montar y configurar un ordenador', 'Afilar cuchillos, tijeras o herramientas', 'Reparar o tapizar una silla'],
            ['Sew, hem, or sew on a button', 'Fix a zip', 'Repair a bike', 'Small plumbing repairs', 'Change a plug or a switch', 'Set up and configure a computer', 'Sharpen knives, scissors or tools', 'Repair or re-cover a chair'],
            ['Coudre, faire un ourlet, recoudre un bouton', 'Réparer une fermeture éclair', 'Réparer un vélo', 'Petites réparations de plomberie', 'Changer une prise ou un interrupteur', 'Monter et configurer un ordinateur', 'Aiguiser couteaux, ciseaux ou outils', 'Réparer ou retapisser une chaise'],
            ['Coser, fazer uma bainha, pregar um botão', 'Arranjar um fecho', 'Reparar uma bicicleta', 'Pequenos arranjos de canalização', 'Trocar uma ficha ou um interruptor', 'Montar e configurar um computador', 'Afiar facas, tesouras ou ferramentas', 'Reparar ou estofar uma cadeira']
          ),
        },
        {
          title: t('Cuerpo y salud', 'Body and health', 'Le corps et la santé', 'Corpo e saúde'),
          items: L(
            ['Acompañar a una cita médica', 'Hacer compañía a quien vive solo', 'Dar un masaje o cuidados básicos', 'Cuidar a un enfermo unas horas', 'Pasear o dar de comer a un perro', 'Enseñar estiramientos o ejercicios suaves', 'Llevar en bici o andando a quien no puede'],
            ['Go with someone to a medical appointment', 'Keep company with someone who lives alone', 'Give a massage or basic care', 'Look after a sick person for a few hours', 'Walk or feed a dog', 'Teach stretching or gentle exercise', 'Cycle or walk someone who cannot'],
            ['Accompagner à un rendez-vous médical', 'Tenir compagnie à quelqu’un qui vit seul', 'Donner un massage ou des soins de base', 'Garder une personne malade quelques heures', 'Promener ou nourrir un chien', 'Apprendre des étirements ou des exercices doux', 'Emmener à vélo ou à pied quelqu’un qui ne peut pas'],
            ['Acompanhar a uma consulta médica', 'Fazer companhia a quem vive sozinho', 'Dar uma massagem ou cuidados básicos', 'Cuidar de um doente umas horas', 'Passear ou dar de comer a um cão', 'Ensinar alongamentos ou exercícios suaves', 'Levar de bicicleta ou a pé quem não pode']
          ),
        },
        {
          title: t('Aprender y saber', 'Learning and knowledge', 'Apprendre et transmettre', 'Aprender e ensinar'),
          items: L(
            ['Dar clases de idiomas', 'Ayudar con los deberes', 'Enseñar informática básica', 'Explicar matemáticas, física o química', 'Enseñar a tocar un instrumento', 'Compartir un oficio: albañilería, costura, cocina', 'Corregir o traducir un texto', 'Enseñar a leer o a escribir'],
            ['Give language lessons', 'Help with homework', 'Teach basic computing', 'Explain maths, physics or chemistry', 'Teach someone to play an instrument', 'Share a trade: building, sewing, cooking', 'Proofread or translate a text', 'Teach someone to read or write'],
            ['Donner des cours de langues', 'Aider pour les devoirs', 'Enseigner l’informatique de base', 'Expliquer les maths, la physique ou la chimie', 'Apprendre à jouer d’un instrument', 'Partager un métier : maçonnerie, couture, cuisine', 'Corriger ou traduire un texte', 'Apprendre à lire ou à écrire'],
            ['Dar aulas de línguas', 'Ajudar com os deveres', 'Ensinar informática básica', 'Explicar matemática, física ou química', 'Ensinar a tocar um instrumento', 'Partilhar um ofício: construção, costura, cozinha', 'Corrigir ou traduzir um texto', 'Ensinar a ler ou a escrever']
          ),
        },
        {
          title: t('Cuidar', 'Caring', 'Prendre soin', 'Cuidar'),
          items: L(
            ['Cuidar niños una tarde', 'Llevar y traer del colegio', 'Cuidar a un mayor unas horas', 'Hacer compañía a alguien recién llegado al barrio', 'Traducir para quien no habla el idioma', 'Hacer la compra o la comida a quien no puede salir', 'Visitar a alguien que está solo'],
            ['Babysit for an afternoon', 'School pick-up and drop-off', 'Look after an elderly person for a few hours', 'Keep company with someone new to the neighbourhood', 'Translate for someone who does not speak the language', 'Shop or cook for someone who cannot go out', 'Visit someone who is alone'],
            ['Garder des enfants un après-midi', 'Conduire les enfants à l’école et les ramener', 'Garder une personne âgée quelques heures', 'Tenir compagnie à un nouvel arrivant du quartier', 'Traduire pour quelqu’un qui ne parle pas la langue', 'Faire les courses ou à manger pour quelqu’un qui ne peut pas sortir', 'Rendre visite à quelqu’un qui est seul'],
            ['Cuidar de crianças uma tarde', 'Levar e trazer da escola', 'Cuidar de um idoso umas horas', 'Fazer companhia a alguém recém-chegado ao bairro', 'Traduzir para quem não fala a língua', 'Fazer as compras ou a comida a quem não pode sair', 'Visitar alguém que está sozinho']
          ),
        },
        {
          title: t('Coches, viajes y recados', 'Cars, travel and errands', 'Voitures, voyages et courses', 'Carros, viagens e recados'),
          items: L(
            ['Llevar al aeropuerto o a la estación', 'Llevar a una cita médica', 'Hacer un recado con el coche', 'Prestar la furgoneta o el remolque, con conductor', 'Ayudar con una compra pesada', 'Hacer un recado en bici o andando', 'Llevar un paquete a otra ciudad'],
            ['Drive someone to the airport or the station', 'Drive someone to a medical appointment', 'Run an errand by car', 'Lend the van or the trailer, with the driver', 'Help with a heavy purchase', 'Run an errand by bike or on foot', 'Take a parcel to another city'],
            ['Emmener à l’aéroport ou à la gare', 'Emmener à un rendez-vous médical', 'Faire une course en voiture', 'Prêter la camionnette ou la remorque, avec le conducteur', 'Aider à porter un achat lourd', 'Faire une course à vélo ou à pied', 'Emporter un colis dans une autre ville'],
            ['Levar ao aeroporto ou à estação', 'Levar a uma consulta médica', 'Fazer um recado de carro', 'Emprestar a carrinha ou o atrelado, com condutor', 'Ajudar com uma compra pesada', 'Fazer um recado de bicicleta ou a pé', 'Levar uma encomenda a outra cidade']
          ),
        },
        {
          title: t('Papeles, pantallas y números', 'Papers, screens and numbers', 'Papiers, écrans et chiffres', 'Papéis, ecrãs e números'),
          items: L(
            ['Ayudar con un trámite o una solicitud', 'Rellenar un formulario o una inscripción', 'Ayudar con el móvil o la tablet', 'Hacer una foto o grabar un vídeo', 'Llevar las cuentas de una pequeña asociación', 'Crear una web o un cartel', 'Imprimir, escanear o enviar un documento', 'Hacer una gestión por teléfono o por internet'],
            ['Help with paperwork or an application', 'Fill in a form or a registration', 'Help with a phone or a tablet', 'Take a photo or record a video', 'Keep the accounts of a small association', 'Build a website or a poster', 'Print, scan or send a document', 'Deal with something by phone or online'],
            ['Aider pour une démarche ou une demande', 'Remplir un formulaire ou une inscription', 'Aider avec le téléphone ou la tablette', 'Prendre une photo ou filmer une vidéo', 'Tenir les comptes d’une petite association', 'Créer un site web ou une affiche', 'Imprimer, scanner ou envoyer un document', 'Faire une démarche par téléphone ou sur internet'],
            ['Ajudar com uma diligência ou um pedido', 'Preencher um formulário ou uma inscrição', 'Ajudar com o telemóvel ou o tablet', 'Tirar uma foto ou gravar um vídeo', 'Ter as contas de uma pequena associação', 'Criar um site ou um cartaz', 'Imprimir, digitalizar ou enviar um documento', 'Fazer uma gestão por telefone ou pela internet']
          ),
        },
      ],
    },
    footer: t(
      'Lets System — plataforma de intercambio local. No es dinero de curso legal. Proyecto sin ánimo de lucro.',
      'Lets System — local exchange platform. Not legal tender. A non-profit project.',
      'Lets System — plateforme d’échange local. N’est pas de la monnaie légale. Projet à but non lucratif.',
      'Lets System — plataforma de troca local. Não é dinheiro de curso legal. Projeto sem fins lucrativos.'
    ),
  };
  // las listas de ideas se resuelven al idioma activo
  out.ideas.categories = out.ideas.categories.map((cat) => ({
    title: cat.title,
    items: cat.items[LANGS[i]] || cat.items.es,
  }));
  return out;
}
