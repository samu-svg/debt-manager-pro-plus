
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CreditCard, Lock, MessageCircle, PieChart, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  // Features section data
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-blue-500" />,
      title: "Mensagens WhatsApp",
      description: "Envio automático de cobranças com templates profissionais e personalizáveis."
    },
    {
      icon: <PieChart className="h-6 w-6 text-blue-500" />,
      title: "Dashboard Completo",
      description: "Visualize todas as métricas importantes para gerenciar suas cobranças."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
      title: "Cálculo de Juros",
      description: "Atualização automática de valores com juros simples ou compostos."
    },
    {
      icon: <Lock className="h-6 w-6 text-blue-500" />,
      title: "Multi-Tenancy Seguro",
      description: "Cada empresa tem seus dados isolados com total privacidade."
    },
    {
      icon: <UserPlus className="h-6 w-6 text-blue-500" />,
      title: "Gestão de Clientes",
      description: "Cadastro completo e histórico de interações com devedores."
    }
  ];

  // Pricing plan data
  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "para sempre",
      features: [
        "Até 50 devedores",
        "100 mensagens WhatsApp/mês",
        "1 usuário",
        "Cálculo de juros simples",
        "Dashboard básico"
      ],
      cta: "Começar Grátis",
      highlight: false
    },
    {
      name: "Premium",
      price: "R$ 99,90",
      period: "por mês",
      features: [
        "Até 1000 devedores",
        "2000 mensagens WhatsApp/mês",
        "10 usuários",
        "Juros simples e compostos",
        "Dashboard avançado",
        "Agendamento de mensagens",
        "Relatórios exportáveis",
        "Suporte prioritário"
      ],
      cta: "Assinar Agora",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "contato",
      features: [
        "Devedores ilimitados",
        "Mensagens WhatsApp ilimitadas",
        "Usuários ilimitados",
        "API personalizada",
        "Integração com seu sistema",
        "Suporte 24/7",
        "Treinamento dedicado"
      ],
      cta: "Fale Conosco",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Gerencie cobranças via WhatsApp de forma eficiente
              </h1>
              <p className="text-xl text-gray-700">
                Plataforma completa para gestão de devedores, cobrança automática e acompanhamento de pagamentos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {user ? (
                  <Button size="lg" asChild>
                    <Link to="/dashboard">
                      Acessar Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link to="/auth/register">
                        Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/auth/login">
                        Fazer Login
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="/placeholder.svg" 
                alt="Dashboard do sistema" 
                className="rounded-lg shadow-xl w-full"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos Poderosos</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Tudo o que você precisa para gerenciar seus devedores e otimizar suas cobranças.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden ${plan.highlight ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl">
                    Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 text-sm">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/auth/register">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Cobranças SaaS</h3>
              <p className="text-gray-400">
                Plataforma completa para gerenciamento de cobranças e comunicação com devedores.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                <li><Link to="/auth/login" className="text-gray-400 hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <p className="text-gray-400">contato@cobrancas.com.br</p>
              <p className="text-gray-400">+55 11 9999-9999</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Cobranças SaaS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
