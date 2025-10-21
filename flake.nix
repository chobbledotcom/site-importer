{
  inputs = {
    nixpkgs.url = "nixpkgs";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;

      makeEnvForSystem =
        system:
        let
          pkgs = import nixpkgs { system = system; };

          devDependencies = with pkgs; [
            nodejs_24
            biome
          ];
        in
        {
          inherit pkgs;
          devEnv = {
            inherit pkgs;
            dependencies = devDependencies;
          };
        };
    in
    {
      devShells = forAllSystems (
        system:
        let
          env = makeEnvForSystem system;
          inherit (env.devEnv)
            pkgs
            dependencies
            ;
        in
        {
          default = pkgs.mkShell {
            buildInputs = dependencies;

            shellHook = ''
              [ ! -d node_modules ] && npm install
              git pull
            '';
          };
        }
      );
    };
}
