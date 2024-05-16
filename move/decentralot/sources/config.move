module decentralot::config {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::event::emit;
    use sui::transfer;

    const MAX_FEE_BPS: u64 = 300; // 30%
    const INIT_FEE_BPS: u64 = 200; // 20%

    const VERSION: u64 = 1;

    // ----- Errors
    const EFeeAboveMax: u64 = 0;
    const EPackageVersionMissmatch: u64 = 1;


    struct AdminCap has key, store {
        id: UID,
    }
    
    struct Config has key, store {
        id: UID,
        protocol_fee_bps: u64,
        package_version: u64,
    }

    // ----- Events
    struct Init has copy, drop {
        admin_cap: ID,
        config: ID,
    }

    struct UpdateProtocolFeeRate has copy, drop {
        old_fee_bps: u64,
        new_fee_bps: u64,
    }

    struct UpdatePackageVersion has copy, drop {
        new_version: u64,
    }

    fun init(ctx: &mut TxContext) {
        let config = Config {
            id: object::new(ctx),
            protocol_fee_bps: INIT_FEE_BPS,
            package_version: VERSION
        };
        let config_id = object::id(&config);

        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        let admin_cap_id = object::id(&admin_cap);

    
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(config);

        emit(Init {
            admin_cap: admin_cap_id,
            config: config_id,
        });
    }

    public fun set_protocol_fee_bps(_: &AdminCap, config: &mut Config, new_fee_bps: u64) {
        assert!(new_fee_bps <= MAX_FEE_BPS, EFeeAboveMax);
        let old_fee_bps = config.protocol_fee_bps;
        config.protocol_fee_bps = new_fee_bps;

        emit(UpdateProtocolFeeRate {
            old_fee_bps,
            new_fee_bps,
        })
    }

    public fun update_package_version(_: &AdminCap, config: &mut Config) {
        config.package_version = VERSION;
        emit(UpdatePackageVersion {
            new_version: VERSION,
        });
    }

    public fun assert_version(config: &Config) {
        assert!(VERSION == config.package_version, EPackageVersionMissmatch);
    }

    // ----- View functions
    public fun protocol_fee_bps(config: &Config): u64 {
        config.protocol_fee_bps
    }

    public fun max_protocol_fee_bps(): u64 {
        MAX_FEE_BPS
    }

    public fun version(): u64 {
        VERSION
    }
}